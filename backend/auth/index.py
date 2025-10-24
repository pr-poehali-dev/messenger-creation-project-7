import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User registration and login with plain password storage
    Args: event - dict with httpMethod, body (username, email, password, full_name)
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
        email = body_data.get('email')
        password = body_data.get('password')
        full_name = body_data.get('full_name', '')
        
        cur.execute(
            "INSERT INTO users (username, email, password, full_name) VALUES (%s, %s, %s, %s) RETURNING id, username, email, full_name",
            (username, email, password, full_name)
        )
        user = cur.fetchone()
        conn.commit()
        
        result = {
            'id': user[0],
            'username': user[1],
            'email': user[2],
            'full_name': user[3]
        }
        
    elif action == 'login':
        username = body_data.get('username')
        password = body_data.get('password')
        
        cur.execute(
            "SELECT id, username, email, full_name FROM users WHERE username = %s AND password = %s",
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
            'email': user[2],
            'full_name': user[3]
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
