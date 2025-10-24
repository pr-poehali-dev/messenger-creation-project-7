import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Create groups, add members, get group messages
    Args: event - dict with httpMethod, headers (X-User-Id), body (name, description, user_ids)
          context - object with request_id attribute
    Returns: HTTP response with group data or messages
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
        cur.execute("""
            SELECT g.id, g.name, g.description, g.avatar_url, g.creator_id,
                   (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
            FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = %s
            ORDER BY g.created_at DESC
        """, (user_id,))
        
        groups = []
        for row in cur.fetchall():
            groups.append({
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'avatar_url': row[3],
                'creator_id': row[4],
                'member_count': row[5],
                'is_group': True
            })
        
        result = {'groups': groups}
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'create':
            name = body_data.get('name')
            description = body_data.get('description', '')
            
            cur.execute(
                "INSERT INTO groups (name, description, creator_id) VALUES (%s, %s, %s) RETURNING id, name, description, avatar_url, creator_id",
                (name, description, user_id)
            )
            group = cur.fetchone()
            
            cur.execute(
                "INSERT INTO group_members (group_id, user_id) VALUES (%s, %s)",
                (group[0], user_id)
            )
            conn.commit()
            
            result = {
                'id': group[0],
                'name': group[1],
                'description': group[2],
                'avatar_url': group[3],
                'creator_id': group[4],
                'is_group': True
            }
        
        elif action == 'add_member':
            group_id = body_data.get('group_id')
            member_id = body_data.get('member_id')
            
            cur.execute(
                "INSERT INTO group_members (group_id, user_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (group_id, member_id)
            )
            conn.commit()
            
            result = {'success': True}
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
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
