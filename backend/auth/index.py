import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User registration and login with plain password storage, profile update
    Args: event - dict with httpMethod, body (username, password for login/register; nickname, bio, avatar_url for update)
          context - object with request_id attribute
    Returns: HTTP response with user data or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action')
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if action == 'register':
        username = body_data.get('username')
        password = body_data.get('password')
        nickname = body_data.get('nickname', username)
        
        cur.execute(
            "INSERT INTO users (username, password, nickname, email, full_name) VALUES (%s, %s, %s, 'temp@temp.com', %s) RETURNING id, username, nickname, avatar_url, bio",
            (username, password, nickname, nickname)
        )
        user = cur.fetchone()
        conn.commit()
        
        result = {
            'id': user[0],
            'username': user[1],
            'nickname': user[2],
            'avatar_url': user[3],
            'bio': user[4]
        }
        
    elif action == 'login':
        username = body_data.get('username')
        password = body_data.get('password')
        
        cur.execute(
            "SELECT id, username, nickname, avatar_url, bio FROM users WHERE username = %s AND password = %s",
            (username, password)
        )
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid credentials'}),
                'isBase64Encoded': False
            }
        
        cur.execute("UPDATE users SET online = true, last_seen = CURRENT_TIMESTAMP WHERE id = %s", (user[0],))
        conn.commit()
        
        result = {
            'id': user[0],
            'username': user[1],
            'nickname': user[2],
            'avatar_url': user[3],
            'bio': user[4]
        }
        
    elif action == 'update_profile':
        user_id = body_data.get('user_id')
        nickname = body_data.get('nickname')
        bio = body_data.get('bio')
        avatar_url = body_data.get('avatar_url')
        
        cur.execute(
            "UPDATE users SET nickname = %s, bio = %s, avatar_url = %s WHERE id = %s RETURNING id, username, nickname, avatar_url, bio",
            (nickname, bio, avatar_url, user_id)
        )
        user = cur.fetchone()
        conn.commit()
        
        result = {
            'id': user[0],
            'username': user[1],
            'nickname': user[2],
            'avatar_url': user[3],
            'bio': user[4]
        }
    else:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid action'}),
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
