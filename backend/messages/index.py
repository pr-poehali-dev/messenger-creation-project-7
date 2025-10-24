import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Send and retrieve messages between users
    Args: event - dict with httpMethod, headers (X-User-Id), body (receiver_id, message_text)
          context - object with request_id attribute
    Returns: HTTP response with messages or confirmation
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if method == 'GET':
        query_params = event.get('queryStringParameters', {})
        other_user_id = query_params.get('user_id')
        
        if other_user_id:
            cur.execute("""
                SELECT m.id, m.sender_id, m.receiver_id, m.message_text, m.created_at,
                       u1.username as sender_username, u2.username as receiver_username
                FROM messages m
                JOIN users u1 ON m.sender_id = u1.id
                JOIN users u2 ON m.receiver_id = u2.id
                WHERE (m.sender_id = %s AND m.receiver_id = %s) 
                   OR (m.sender_id = %s AND m.receiver_id = %s)
                ORDER BY m.created_at ASC
            """, (user_id, other_user_id, other_user_id, user_id))
            
            messages = []
            for row in cur.fetchall():
                messages.append({
                    'id': row[0],
                    'sender_id': row[1],
                    'receiver_id': row[2],
                    'text': row[3],
                    'time': row[4].strftime('%H:%M'),
                    'sender_username': row[5],
                    'receiver_username': row[6]
                })
            
            result = {'messages': messages}
        else:
            cur.execute("""
                SELECT DISTINCT ON (other_user_id)
                    other_user_id,
                    u.username,
                    u.full_name,
                    u.online,
                    last_message,
                    last_message_time,
                    unread_count
                FROM (
                    SELECT 
                        CASE 
                            WHEN sender_id = %s THEN receiver_id 
                            ELSE sender_id 
                        END as other_user_id,
                        message_text as last_message,
                        created_at as last_message_time,
                        (SELECT COUNT(*) FROM messages 
                         WHERE sender_id = CASE WHEN sender_id = %s THEN receiver_id ELSE sender_id END
                         AND receiver_id = %s AND is_read = false) as unread_count
                    FROM messages
                    WHERE sender_id = %s OR receiver_id = %s
                    ORDER BY created_at DESC
                ) sub
                JOIN users u ON u.id = sub.other_user_id
                ORDER BY other_user_id, last_message_time DESC
            """, (user_id, user_id, user_id, user_id, user_id))
            
            chats = []
            for row in cur.fetchall():
                chats.append({
                    'id': row[0],
                    'name': row[2] or row[1],
                    'lastMessage': row[4][:50] + '...' if len(row[4]) > 50 else row[4],
                    'time': row[5].strftime('%H:%M'),
                    'unread': row[6],
                    'online': row[3]
                })
            
            result = {'chats': chats}
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        receiver_id = body_data.get('receiver_id')
        message_text = body_data.get('message_text')
        
        cur.execute(
            "INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (%s, %s, %s) RETURNING id, created_at",
            (user_id, receiver_id, message_text)
        )
        msg = cur.fetchone()
        conn.commit()
        
        result = {
            'id': msg[0],
            'sender_id': int(user_id),
            'receiver_id': receiver_id,
            'text': message_text,
            'time': msg[1].strftime('%H:%M')
        }
    else:
        cur.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(result),
        'isBase64Encoded': False
    }
