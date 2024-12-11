from flask import Flask, session, request, jsonify, make_response
from flask_session import Session
import sqlite3
from flask_cors import CORS
import random
import string

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_key'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_COOKIE_NAME'] = 'session'
# Allow carrying Authorization header
app.config['CORS_HEADERS'] = 'Authorization'
# CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}},
#      expose_headers=["Authorization"])

# Configure CORS to allow access from all origins
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

Session(app)

DATABASE = 'app.db'

# Initialize the database
def init_db():
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            session_id TEXT
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER,
            name TEXT,
            price TEXT,
            image TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    c.execute('''
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                content TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
    conn.commit()
    conn.close()

init_db()

# Generate a random session_id
def generate_session_id():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=32))

# Registration interface
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
        conn.commit()
        return jsonify({"message": "Registration successful"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"message": "Username already exists"}), 409
    finally:
        conn.close()

# Login interface
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE username = ? AND password = ?", (username, password))
    user = c.fetchone()

    if user:
        user_id = user[0]
        # Generate a new random session_id
        session_id = generate_session_id()

        # Update the session_id in the database
        c.execute("UPDATE users SET session_id = ? WHERE id = ?", (session_id, user_id))
        conn.commit()
        conn.close()

        # Return the newly generated session_id to the front end
        response = make_response(jsonify({"message": "Login successful", "session_id": session_id}))
        return response, 200
    else:
        conn.close()
        return jsonify({"message": "Incorrect username or password"}), 401

# Logout interface
@app.route('/logout', methods=['POST'])
def logout():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"message": "Missing authentication information"}), 401

    session_id = auth_header.split(" ")[1]

    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute("UPDATE users SET session_id = NULL WHERE session_id = ?", (session_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Logged out"}), 200

# Function to verify session_id
def verify_session():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None

    session_id = auth_header.split(" ")[1]

    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE session_id = ?", (session_id,))
    user = c.fetchone()
    conn.close()

    if user:
        return user[0]  # Return user ID
    return None

# Add item to cart interface
@app.route('/cart', methods=['POST'])
def add_to_cart():
    user_id = verify_session()
    if not user_id:
        return jsonify({"message": "Invalid session ID, please log in again"}), 401

    data = request.json
    product_id = data.get('id')
    name = data.get('name')
    price = data.get('price')
    image = data.get('image')

    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute("INSERT INTO cart (user_id, product_id, name, price, image) VALUES (?, ?, ?, ?, ?)",
              (user_id, product_id, name, price, image))
    conn.commit()
    conn.close()

    return jsonify({"message": "Item added to cart"}), 201

# Get cart contents interface
@app.route('/cart', methods=['GET'])
def get_cart():
    user_id = verify_session()
    if not user_id:
        return jsonify({"message": "Invalid session ID, please log in again"}), 401

    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute("SELECT id, product_id, name, price, image FROM cart WHERE user_id = ?", (user_id,))
    cart_items = [{"id": row[0], "product_id": row[1], "name": row[2], "price": row[3], "image": row[4]} for row in
                  c.fetchall()]
    conn.close()

    return jsonify(cart_items), 200

# Comment submission and retrieval interface
@app.route('/comments', methods=['GET', 'POST'])
def comments():
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()

    if request.method == 'POST':
        data = request.json
        user_id = session.get('user_id')
        content = data.get('content')  # Receive comment content

        # Store the comment in the database
        c.execute("INSERT INTO comments (user_id, content) VALUES (?, ?)", (user_id, content))
        conn.commit()
        conn.close()
        return jsonify({"message": "Comment submitted"}), 201

    elif request.method == 'GET':
        # Get all comments
        c.execute("SELECT content FROM comments")
        comments = [{"content": row[0]} for row in c.fetchall()]
        conn.close()
        return jsonify(comments), 200

# Remove item from cart interface
@app.route('/cart/<int:item_id>', methods=['DELETE'])
def remove_from_cart(item_id):
    # if 'user_id' not in session:
    #     return jsonify({"message": "Please log in first"}), 401

    # user_id = session['user_id']
    # conn = sqlite3.connect(DATABASE)
    # c = conn.cursor()
    # c.execute("DELETE FROM cart WHERE id = ? AND user_id = ?", (item_id, user_id))
    # conn.commit()
    # conn.close()

    return jsonify({"message": "Item has been removed from the cart"}), 200

if __name__ == '__main__':
    app.run(debug=True)