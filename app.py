from flask import Flask, render_template, jsonify, send_from_directory, redirect, request, session, flash, url_for
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import datetime
import traceback
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import base64
from bson.objectid import ObjectId

# Load environment variables
load_dotenv()

# Create Flask app with explicit static folder configuration
app = Flask(__name__, 
            static_url_path='/static', 
            static_folder='static')

# Only set the absolute minimum session settings
app.secret_key = os.getenv('SECRET_KEY', 'lavasa')

# Upload settings
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# MongoDB connection
def get_db():
    try:
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
        client = MongoClient(mongo_uri)
        
        # Test the connection
        client.server_info()
        
        db = client[os.getenv('MONGO_DB', 'vogue_news')]
        return db
    except Exception as e:
        app.logger.error(f"Failed to connect to MongoDB: {e}")
        return None

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Authentication helper functions
def save_profile_image(image_data):
    """Save a base64 encoded image to the uploads folder"""
    try:
        if image_data.startswith('data:image'):
            # Extract the base64 part
            format_data, imgstr = image_data.split(';base64,')
            ext = format_data.split('/')[-1]
            
            # Generate a unique filename
            timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"profile_{timestamp}.{ext}"
            
            # Decode the base64 string
            imgdata = base64.b64decode(imgstr)
            
            # Save the file
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            with open(file_path, 'wb') as f:
                f.write(imgdata)
                
            return f"uploads/{filename}"
        return None
    except Exception as e:
        app.logger.error(f"Error saving profile image: {e}")
        return None

def is_email_registered(email):
    """Check if an email is already registered"""
    db = get_db()
    if db is None:
        return False
    
    user = db.users.find_one({"email": email})
    return user is not None

def create_user(user_data):
    """Create a new user in the database"""
    db = get_db()
    if db is None:
        return None
    
    try:
        # Hash the password
        user_data['password'] = generate_password_hash(user_data['password'])
        
        # Save profile image if provided
        if 'photoData' in user_data and user_data['photoData']:
            image_path = save_profile_image(user_data['photoData'])
            if image_path:
                user_data['profile_image'] = image_path
            
            # Remove the base64 data to save space in the DB
            del user_data['photoData']
        
        # Add creation timestamp
        user_data['created_at'] = datetime.datetime.now()
        
        # Insert the user
        result = db.users.insert_one(user_data)
        return result.inserted_id
    except Exception as e:
        app.logger.error(f"Error creating user: {e}")
        return None

def login_user(email, password, remember=False):
    """Verify user credentials and log them in"""
    db = get_db()
    if db is None:
        return False, "Database connection error"
    
    try:
        user = db.users.find_one({"email": email})
        
        if not user:
            return False, "Email not found"
        
        if not check_password_hash(user['password'], password):
            return False, "Incorrect password"
        
        # Set session data
        session['user_id'] = str(user['_id'])
        session['email'] = user['email']
        session['name'] = user.get('fullName', 'User')
        
        return True, "Login successful"
    except Exception as e:
        app.logger.error(f"Error during login: {e}")
        return False, "Login failed due to an error"

# Login required decorator
def login_required(f):
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please login to access this page', 'warning')
            return redirect(url_for('login_page'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@app.route('/')
def home():
    # Keep the root route pointing to login.html
    return render_template('login.html')

@app.route('/home')
def home_page():
    # If not logged in, redirect to login page
    if 'user_id' not in session:
        flash('Please login to access this page', 'warning')
        return redirect(url_for('login_page'))
    
    # If logged in, show home page
    return render_template('home.html')

@app.route('/news')
def news():
    return render_template('newspaper.html')

@app.route('/collections')
def collections():
    return render_template('collections.html')

@app.route('/lookbook')
def lookbook():
    return render_template('style_test.html')

# Improved events route with better structure
@app.route('/events', methods=['GET', 'POST'])
def events():
    """
    Handle the events page including challenges, matches, and success stories
    """
    # Initialize empty data structures
    challenges = []
    style_matches = []
    success_stories = []
    
    try:
        # Initialize database connection
        db = get_db()
        if db is None:
            flash("Database connection error. Please try again later.", "error")
            return render_template('events.html', 
                                challenges=[], 
                                style_matches=[], 
                                success_stories=[])

        # Check if user is logged in
        user_id = None
        user = None
        if 'user_id' in session:
            try:
                user_id = ObjectId(session['user_id'])
                user = db.users.find_one({"_id": user_id})
                if not user:
                    logger.warning(f"User not found for ID: {user_id}")
                    session.pop('user_id', None)
                    flash("Invalid user session", "error")
                    return redirect(url_for('login_page'))
            except Exception as e:
                logger.error(f"Error accessing user data: {e}")
                session.pop('user_id', None)
                flash("Invalid user session", "error")
                return redirect(url_for('login_page'))

        # Handle POST requests
        if request.method == 'POST':
            # Handle JSON requests
            if request.is_json:
                return handle_json_requests(db, user_id)
            
            # Handle form submissions
            return handle_form_submissions(db, user_id)

        # Handle GET requests
        return handle_get_requests(db, user_id)

    except Exception as e:
        logger.error(f"Error in events route: {str(e)}")
        logger.error(traceback.format_exc())
        flash("An error occurred. Please try again later.", "error")
        return render_template('events.html', 
                             challenges=[], 
                             style_matches=[], 
                             success_stories=[])

def handle_suggestion(db, user_id, data):
    """Handle suggestion submission"""
    if not user_id:
        return jsonify({'success': False, 'error': 'You must be logged in to add a suggestion.'}), 401

    challenge_id = data.get('challenge_id')
    suggestion_text = data.get('suggestion_text', '').strip()

    if not challenge_id or not suggestion_text:
        return jsonify({'success': False, 'error': 'Challenge ID and suggestion text are required.'}), 400

    try:
        # Validate challenge_id format
        try:
            challenge_id = ObjectId(challenge_id)
        except Exception:
            return jsonify({'success': False, 'error': 'Invalid challenge ID format.'}), 400
        
        # Check if challenge exists
        challenge = db.challenges.find_one({'_id': challenge_id})
        if not challenge:
            return jsonify({'success': False, 'error': 'Challenge not found.'}), 404
        
        # Create suggestion
        suggestion = {
                'challenge_id': challenge_id,
                'user_id': user_id,
                'text': suggestion_text,
                'created_at': datetime.datetime.utcnow()
            }
        result = db.suggestions.insert_one(suggestion)

        # Get user info
        user = db.users.find_one({'_id': user_id})
        user_info = {
            'name': user.get('fullName', 'You'),
            'profile_image': user.get('profile_image', None)
        } if user else {
            'name': 'You', 'profile_image': None
        }

        return jsonify({
            'success': True,
            'suggestion': {
                'id': str(result.inserted_id),
                'user': user_info,
                'text': suggestion_text,
                'created_at': 'Just now',
                'can_like': False
            }
        })
    except Exception as e:
        logger.error(f"Error adding suggestion: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to add suggestion. Please try again.'}), 500

def handle_volunteer(db, user_id, data):
    """Handle volunteer requests"""
    if not user_id:
        return jsonify({'success': False, 'error': 'You must be logged in to volunteer.'}), 401

    challenge_id = data.get('challenge_id')
    if not challenge_id:
        return jsonify({'success': False, 'error': 'Challenge ID is required.'}), 400

    try:
        # Validate challenge_id format
        try:
            challenge_id = ObjectId(challenge_id)
        except Exception:
            return jsonify({'success': False, 'error': 'Invalid challenge ID format.'}), 400
        
        # Check if challenge exists
        challenge = db.challenges.find_one({'_id': challenge_id})
        if not challenge:
            return jsonify({'success': False, 'error': 'Challenge not found.'}), 404
        
        # Prevent duplicate volunteering
        existing = db.volunteers.find_one({
            'user_id': user_id,
            'challenge_id': challenge_id
        })
        if existing:
            return jsonify({'success': False, 'error': 'You have already volunteered for this challenge.'}), 400

        # Add volunteer record
        db.volunteers.insert_one({
            'user_id': user_id,
            'challenge_id': challenge_id,
            'created_at': datetime.datetime.utcnow()
        })

        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Error volunteering for challenge: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to volunteer for challenge. Please try again.'}), 500

def handle_like(db, user_id, data):
    """Handle liking a suggestion"""
    if not user_id:
        return jsonify({'success': False, 'error': 'You must be logged in to like suggestions.'}), 401
    
    suggestion_id = data.get('suggestion_id')
    if not suggestion_id:
        return jsonify({'success': False, 'error': 'Suggestion ID is required.'}), 400
    
    try:
        # Validate suggestion_id format
        try:
            suggestion_id = ObjectId(suggestion_id)
        except Exception:
            return jsonify({'success': False, 'error': 'Invalid suggestion ID format.'}), 400
        
        # Check if suggestion exists
        suggestion = db.suggestions.find_one({'_id': suggestion_id})
        if not suggestion:
            return jsonify({'success': False, 'error': 'Suggestion not found.'}), 404
        
        # Prevent duplicate likes
        existing = db.likes.find_one({
            'user_id': user_id,
            'suggestion_id': suggestion_id
        })
        if existing:
            return jsonify({'success': False, 'error': 'You have already liked this suggestion.'}), 400
        
        # Add like record
        db.likes.insert_one({
            'user_id': user_id,
            'suggestion_id': suggestion_id,
            'created_at': datetime.datetime.utcnow()
        })
        
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Error liking suggestion: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to like suggestion. Please try again.'}), 500

def handle_send_message(db, user_id, data):
    """Handle sending a message"""
    if not user_id:
        return jsonify({'success': False, 'error': 'You must be logged in to send messages.'}), 401
    
    receiver_id = data.get('receiver_id')
    message_text = data.get('message', '').strip()
    
    if not receiver_id or not message_text:
        return jsonify({'success': False, 'error': 'Receiver ID and message are required.'}), 400
    
    try:
        # Validate receiver_id format
        try:
            receiver_id = ObjectId(receiver_id)
        except Exception:
            return jsonify({'success': False, 'error': 'Invalid receiver ID format.'}), 400
        
        # Check if receiver exists
        receiver = db.users.find_one({'_id': receiver_id})
        if not receiver:
            return jsonify({'success': False, 'error': 'Receiver not found.'}), 404
        
        # Create message
        message = {
            'sender_id': user_id,
            'receiver_id': receiver_id,
            'message': message_text,
            'created_at': datetime.datetime.utcnow(),
            'read': False
        }
        
        result = db.messages.insert_one(message)
        
        return jsonify({
            'success': True,
            'message_id': str(result.inserted_id)
        })
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to send message. Please try again.'}), 500

def handle_get_messages(db, user_id, data):
    """Handle retrieving messages"""
    if not user_id:
        return jsonify({'success': False, 'error': 'You must be logged in to view messages.'}), 401
    
    partner_id = data.get('user_id')
    if not partner_id:
        return jsonify({'success': False, 'error': 'Partner ID is required.'}), 400
    
    try:
        # Validate partner_id format
        try:
            partner_id = ObjectId(partner_id)
        except Exception:
            return jsonify({'success': False, 'error': 'Invalid partner ID format.'}), 400
        
        # Check if partner exists
        partner = db.users.find_one({'_id': partner_id})
        if not partner:
            return jsonify({'success': False, 'error': 'Partner not found.'}), 404
        
        # Get messages
        messages_query = {
            '$or': [
                {'sender_id': user_id, 'receiver_id': partner_id},
                {'sender_id': partner_id, 'receiver_id': user_id}
            ]
        }
        
        messages_cursor = db.messages.find(messages_query).sort('created_at', 1)
        
        messages = []
        for msg in messages_cursor:
            # Mark as read if current user is the receiver
            if msg['receiver_id'] == user_id and not msg.get('read', False):
                db.messages.update_one({'_id': msg['_id']}, {'$set': {'read': True}})
            
            # Format date
            created_at = msg['created_at']
            if isinstance(created_at, datetime.datetime):
                formatted_date = created_at.strftime('%b %d, %Y %I:%M %p')
            else:
                formatted_date = 'Unknown date'
            
            messages.append({
                'id': str(msg['_id']),
                'sender_id': str(msg['sender_id']),
                'receiver_id': str(msg['receiver_id']),
                'message': msg['message'],
                'created_at': formatted_date,
                'is_current_user': msg['sender_id'] == user_id
            })
        
        return jsonify({
            'success': True,
            'messages': messages
        })
    except Exception as e:
        logger.error(f"Error getting messages: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to retrieve messages. Please try again.'}), 500

def handle_store_action(db, user_id, data):
    """Store user actions for analytics"""
    if not user_id:
        return jsonify({'success': False, 'error': 'You must be logged in to store actions.'}), 401
    
    action_type = data.get('action_type')
    target_id = data.get('target_id')
    details = data.get('details', '')
    
    if not action_type or not target_id:
        return jsonify({'success': False, 'error': 'Action type and target ID are required.'}), 400
    
    try:
        # Store action
        action = {
            'user_id': user_id,
            'action_type': action_type,
            'target_id': target_id,
            'details': details,
            'created_at': datetime.datetime.utcnow()
        }
        
        db.user_actions.insert_one(action)
        
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Error storing user action: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to store action.'}), 500

def handle_filter_matches(db, user_id, data):
    """Handle filtering matches by role"""
    if not user_id:
        return jsonify({'success': False, 'error': 'You must be logged in to filter matches.'}), 401
    
    role = data.get('role', 'both')
    
    try:
        # Get filtered matches
        matches = fetch_matches(db, user_id, role)
        
        return jsonify({
            'success': True,
            'matches': matches
        })
    except Exception as e:
        logger.error(f"Error filtering matches: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to filter matches. Please try again.'}), 500

def handle_json_requests(db, user_id):
    """Handle JSON API requests"""
    try:
        # Log received data for debugging
        app.logger.info(f"Received JSON request: {request.data}")
        
        # Ensure request has JSON data
        if not request.is_json:
            app.logger.error("Request content type is not JSON")
            return jsonify({'success': False, 'error': 'Content type must be application/json'}), 400
        
        data = request.json
        if not data:
            app.logger.error("Empty JSON data received")
            return jsonify({'success': False, 'error': 'Empty JSON data'}), 400
        
        action = data.get('action')
        if not action:
            app.logger.error("No action specified in request")
            return jsonify({'success': False, 'error': 'Action is required'}), 400
        
        # Log the action
        app.logger.info(f"Processing action: {action}")
        
        # Map actions to handler functions
        action_handlers = {
            'connect': handle_connection,
            'add_suggestion': handle_suggestion,
            'like_suggestion': handle_like,
            'volunteer': handle_volunteer,
            'send_message': handle_send_message,
            'get_messages': handle_get_messages,
            'store_action': handle_store_action,
            'filter_matches': handle_filter_matches,
        }
        
        # Check if action is valid
        if action not in action_handlers:
            app.logger.error(f"Invalid action: {action}")
            return jsonify({'success': False, 'error': f'Invalid action: {action}'}), 400
        
        # Call appropriate handler
        return action_handlers[action](db, user_id, data)

    except Exception as e:
        app.logger.error(f"Error handling JSON request: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500

def handle_form_submissions(db, user_id):
    """Handle form POST submissions"""
    action = request.form.get('action')
    
    # Handle create challenge action
    if action == 'create_challenge':
        # Validate user
        if not user_id:
            flash("You must be logged in to create a challenge", "error")
            return redirect(url_for('events'))

        # Validate form data
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        
        if not title or not description:
            flash("Title and description are required", "error")
            return redirect(url_for('events'))

        # Handle image upload
        image_path = None
        if 'image' in request.files:
            image_file = request.files['image']
            if image_file and image_file.filename:
                if not allowed_file(image_file.filename):
                    flash("Invalid file type. Allowed types: png, jpg, jpeg, gif", "error")
                    return redirect(url_for('events'))
                
                # Additional validation for file content
                if not allowed_mime_type(image_file):
                    flash("Invalid file content", "error")
                    return redirect(url_for('events'))
                
                try:
                    filename = secure_filename(image_file.filename)
                    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
                    filename = f"challenge_{timestamp}_{filename}"
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    
                    # Save file
                    image_file.save(file_path)
                    image_path = f"uploads/{filename}"
                except Exception as e:
                    logger.error(f"Error saving image: {str(e)}")
                    flash("Error uploading image", "error")

        # Create challenge
        challenge = {
            'user_id': user_id,
            'title': title,
            'description': description,
            'item_image': image_path,
            'created_at': datetime.datetime.now()
        }
        
        try:
            db.challenges.insert_one(challenge)
            flash('Challenge created successfully!', 'success')
        except Exception as e:
            logger.error(f"Error creating challenge: {str(e)}")
            flash("Error creating challenge", "error")

    return redirect(url_for('events'))

def handle_get_requests(db, user_id):
    """Handle GET requests for the events page"""
    # Initialize variables
    challenges = []
    style_matches = []
    success_stories = []

    # Handle actions
    action = request.args.get('action')
    
    if action == 'new_challenge':
        flash('Create challenge feature is now available! Click "Create Challenge" button.', 'info')
    elif action == 'messages':
        partner_id = request.args.get('user_id')
        if not partner_id:
            flash('User ID is missing', 'error')
        else:
            try:
                partner = db.users.find_one({"_id": ObjectId(partner_id)})
                if not partner:
                    flash('User not found', 'error')
                elif user_id:
                    db.messages.update_many(
                        {'sender_id': ObjectId(partner_id), 'receiver_id': user_id, 'read': False},
                        {'$set': {'read': True}}
                    )
                    flash('Click the message button to open the chat with this user', 'info')
            except Exception as e:
                logger.error(f"Error handling messages action: {str(e)}")
                flash('Invalid user ID', 'error')
    elif action == 'filter_matches' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        role = request.args.get('role', 'both')
        filtered_matches = fetch_matches(db, user_id, role)
        matches_html = render_template('matches_partial.html', matches=filtered_matches)
        return jsonify({'success': True, 'html': matches_html})

    # Fetch data for main page
    try:
        # Get challenges
        challenges = get_challenges(db, user_id)
        
        # Get matches
        style_matches = fetch_matches(db, user_id, 'both')
        
        # Get success stories
        success_stories = get_success_stories(db)
        
    except Exception as e:
        logger.error(f"Error fetching data: {str(e)}")
        logger.error(traceback.format_exc())
        flash("Error loading data", "error")

    return render_template('events.html',
                         challenges=challenges,
                         style_matches=style_matches,
                         success_stories=success_stories)

def handle_connection(db, user_id, data):
    """Handle connection requests between users"""
    if not user_id:
        return jsonify({'success': False, 'error': 'You must be logged in to connect with users.'}), 401
    
    receiver_id = data.get('receiver_id')
    if not receiver_id:
        return jsonify({'success': False, 'error': 'Receiver ID is required.'}), 400
    
    try:
        # Validate receiver_id format
        try:
            receiver_id = ObjectId(receiver_id)
        except Exception:
            return jsonify({'success': False, 'error': 'Invalid receiver ID format.'}), 400
        
        # Check if receiver exists
        receiver = db.users.find_one({"_id": receiver_id})
        if not receiver:
            return jsonify({'success': False, 'error': 'User not found.'}), 404
        
        # Prevent connecting to self
        if user_id == receiver_id:
            return jsonify({'success': False, 'error': 'You cannot connect with yourself.'}), 400
        
        # Check if connection already exists
        existing = db.connections.find_one({
            '$or': [
                {'user_id': user_id, 'receiver_id': receiver_id},
                {'user_id': receiver_id, 'receiver_id': user_id}
            ]
        })
        
        if existing:
            if existing['status'] == 'accepted':
                return jsonify({'success': False, 'error': 'You are already connected with this user.'}), 400
            elif existing['user_id'] == user_id:
                return jsonify({'success': False, 'error': 'You have already sent a connection request to this user.'}), 400
            else:
                # If the other user sent a request, accept it
                db.connections.update_one(
                    {"_id": existing["_id"]},
                    {"$set": {"status": "accepted", "accepted_at": datetime.datetime.utcnow()}}
                )
                return jsonify({'success': True, 'message': 'Connection accepted successfully.'}), 200
        
        # Create new connection
        db.connections.insert_one({
            'user_id': user_id,
            'receiver_id': receiver_id,
            'status': 'pending',
            'created_at': datetime.datetime.utcnow()
        })
        
        return jsonify({'success': True})
    except Exception as e:
        app.logger.error(f"Error connecting users: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to create connection. Please try again.'}), 500

def get_challenges(db, user_id):
    """Get challenges with user info and suggestions"""
    challenges = []
    for challenge in db.challenges.find().sort('created_at', -1):
        user_info = None
        if 'user_id' in challenge:
            try:
                user_info = db.users.find_one({"_id": challenge['user_id']})
            except Exception as e:
                logger.error(f"Error fetching user info for challenge: {str(e)}")
        
        if not user_info:
            user_info = {
                'id': str(challenge['user_id']) if 'user_id' in challenge else 'unknown',
                'name': 'Anonymous User',
                'profile_image': None,
                'personality_type': 'Unknown',
                'style_description': 'Style preferences not set'
            }
        else:
            # Convert ObjectId to string for JSON serialization
            user_info['id'] = str(user_info['_id'])
        
        # Get suggestions
        suggestions = []
        try:
            for suggestion in db.suggestions.find({'challenge_id': challenge['_id']}):
                suggestion_user = None
                if 'user_id' in suggestion:
                    try:
                        suggestion_user = db.users.find_one({"_id": suggestion['user_id']})
                    except Exception as e:
                        logger.error(f"Error fetching user info for suggestion: {str(e)}")
                
                if not suggestion_user:
                    suggestion_user = {
                        'id': str(suggestion['user_id']) if 'user_id' in suggestion else 'unknown',
                        'name': 'Anonymous User',
                        'profile_image': None
                    }
                else:
                    # Convert ObjectId to string for JSON serialization
                    suggestion_user['id'] = str(suggestion_user['_id'])
                
                # Check if current user can like this suggestion
                can_like = False
                if user_id and 'user_id' in challenge and str(user_id) == str(challenge['user_id']) and ('user_id' not in suggestion or str(suggestion['user_id']) != str(user_id)):
                    try:
                        liked = db.likes.find_one({
                            'user_id': user_id,
                            'suggestion_id': suggestion['_id']
                        })
                        can_like = not liked
                    except Exception as e:
                        logger.error(f"Error checking like status: {str(e)}")
                
                suggestions.append({
                    'id': str(suggestion['_id']),
                    'user': suggestion_user,
                    'text': suggestion['text'],
                    'created_at': suggestion['created_at'].strftime('%b %d, %Y %I:%M %p') if 'created_at' in suggestion else 'Unknown date',
                    'can_like': can_like
                })
        except Exception as e:
            logger.error(f"Error fetching suggestions: {str(e)}")
        
        challenges.append({
            'id': str(challenge['_id']),
            'user': user_info,
            'title': challenge.get('title', 'Unnamed Challenge'),
            'description': challenge.get('description', ''),
            'item_image': challenge.get('item_image'),
            'created_at': challenge['created_at'].strftime('%b %d, %Y') if 'created_at' in challenge else 'Unknown date',
            'suggestions': suggestions
        })
    
    return challenges

def get_success_stories(db):
    """Get success stories with user info"""
    stories = []
    try:
        for story in db.success_stories.find().sort('created_at', -1):
            user1 = None
            user2 = None
            
            if 'user1_id' in story:
                try:
                    user1 = db.users.find_one({"_id": story['user1_id']})
                except Exception as e:
                    logger.error(f"Error fetching user1 info for story: {str(e)}")
            
            if 'user2_id' in story:
                try:
                    user2 = db.users.find_one({"_id": story['user2_id']})
                except Exception as e:
                    logger.error(f"Error fetching user2 info for story: {str(e)}")
            
            if not user1:
                user1 = {'name': 'User 1', 'personality_type': 'Unknown', 'profile_image': None}
            if not user2:
                user2 = {'name': 'User 2', 'personality_type': 'Unknown', 'profile_image': None}
            
            stories.append({
                'id': str(story['_id']),
                'title': story.get('title', 'Untitled Success Story'),
                'content': story.get('content', ''),
                'user1': user1,
                'user2': user2
            })
    except Exception as e:
        logger.error(f"Error fetching success stories: {str(e)}")
    
    # Return default story if none found
    if not stories:
        stories = [{
            'id': '1',
            'title': 'From Confused to Confident',
            'content': 'Ananya helped me understand how to dress for my body type. Her inclusive approach completely transformed how I see myself and gave me confidence I never had before.',
            'user1': {'name': 'Divya T.', 'personality_type': 'INFP', 'profile_image': None},
            'user2': {'name': 'Ananya M.', 'personality_type': 'ENFJ', 'profile_image': None}
        }]
    
    return stories

def fetch_matches(db, user_id, role='both'):
    """
    Fetch style matches for a user based on role
    Implemented the missing function that was causing errors
    """
    if not user_id:
        return []
    
    matches = []
    
    try:
        # Get user data
        user = db.users.find_one({"_id": user_id})
        if not user:
            logger.warning(f"User not found for ID: {user_id}")
            return []
        
        # Get user style preferences
        user_style = user.get('stylePreference', '')
        user_styling = user.get('styling', 'no')
        
        # Determine what role to search for
        match_role = None
        if role == 'seeking':
            match_role = 'yes'  # Find users offering styling
        elif role == 'offering':
            match_role = 'no'   # Find users seeking styling
        
        # Build query
        query = {"_id": {"$ne": user_id}}
        
        if match_role is not None:
            query["styling"] = match_role
        
        # Find matching users
        potential_matches = db.users.find(query).limit(20)
        
        # For each potential match, get connection status and calculate compatibility
        for match_user in potential_matches:
            # Check connection status
            connection = db.connections.find_one({
                '$or': [
                    {'user_id': user_id, 'receiver_id': match_user['_id']},
                    {'user_id': match_user['_id'], 'receiver_id': user_id}
                ]
            })
            
            status = 'new'
            if connection:
                if connection['status'] == 'accepted':
                    status = 'connected'
                else:
                    status = 'pending'
            
            # Calculate compatibility
            compatibility_score = calculate_compatibility(match_user, user, db)
            compatibility_reason = generate_compatibility_reason(match_user, compatibility_score)
            
            # Build match object
            match = {
                'user': {
                    'id': str(match_user['_id']),
                    'name': match_user.get('fullName', 'Anonymous User'),
                    'profile_image': match_user.get('profile_image'),
                    'personality_type': match_user.get('personality_type', 'Unknown'),
                    'style_description': match_user.get('stylePreference', 'No style preferences set'),
                    'skill_level': match_user.get('skill_level', 'Beginner'),
                    'specialties': match_user.get('specialties', ['Fashion'])
                },
                'status': status,
                'compatibility_score': compatibility_score,
                'compatibility_reason': compatibility_reason
            }
            
            matches.append(match)
    except Exception as e:
        logger.error(f"Error fetching matches: {str(e)}")
        logger.error(traceback.format_exc())
    
    return matches

def calculate_compatibility(match_user, current_user, db):
    """Calculate compatibility score between users"""
    # This is a simple implementation - could be replaced with a more sophisticated algorithm
    try:
        base_score = 70  # Base compatibility score
        
        # Add points for matching style preferences
        user_style = current_user.get('stylePreference', '').lower()
        match_style = match_user.get('stylePreference', '').lower()
        
        if user_style and match_style:
            # Check for common words in style preferences
            user_words = set(user_style.split())
            match_words = set(match_style.split())
            common_words = user_words.intersection(match_words)
            
            # Add points for common style words (max 15 points)
            style_points = min(len(common_words) * 3, 15)
            base_score += style_points
        
        # Add random variation (±5 points)
        import random
        random_factor = random.randint(-5, 5)
        
        final_score = base_score + random_factor
        
        # Ensure score is between 70 and 95
        return max(70, min(final_score, 95))
    except Exception as e:
        logger.error(f"Error calculating compatibility: {str(e)}")
        # Return a default score in case of errors
        return 80

def generate_compatibility_reason(user, score):
    """Generate a reason for the compatibility score"""
    reasons = [
        "You both value ethical fashion and minimalist aesthetics",
        "Your organization styles complement each other perfectly",
        "You share similar color preferences and fashion inspirations",
        "Your style personalities balance each other well",
        "You both appreciate similar design elements and aesthetics"
    ]
    
    try:
        # Try to generate a more personalized reason based on user data
        style_pref = user.get('stylePreference', '').lower()
        
        if 'minimal' in style_pref or 'clean' in style_pref:
            reasons.append("You both appreciate minimalist and clean aesthetic")
        
        if 'color' in style_pref or 'bright' in style_pref:
            reasons.append("You both enjoy colorful and vibrant fashion choices")
        
        if 'vintage' in style_pref or 'retro' in style_pref:
            reasons.append("You share an appreciation for vintage and retro styles")
        
        if 'sustain' in style_pref or 'eco' in style_pref or 'ethical' in style_pref:
            reasons.append("You both value sustainable and ethical fashion choices")
        
        # Select a reason based on the compatibility score
        if score >= 90:
            high_reasons = [r for r in reasons if 'both' in r or 'share' in r]
            if high_reasons:
                return high_reasons[0]
        
        # Pick a random reason
        import random
        return random.choice(reasons)
    except Exception as e:
        logger.error(f"Error generating compatibility reason: {str(e)}")
        # Return a default reason in case of errors
        return "Your style preferences seem compatible"

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/shop')
def shop():
    return render_template('shop.html')

@app.route('/login')
def login_page():
    # If already logged in, redirect to home
    if 'user_id' in session:
        return redirect(url_for('home_page'))
    
    return render_template('login.html')

@app.route('/register', methods=['POST'])
def register():
    """Handle user registration"""
    try:
        # Check if email is already registered
        email = request.form.get('email')
        if email is None:
            return jsonify({"success": False, "message": "Email is required"}), 400
            
        if is_email_registered(email):
            return jsonify({"success": False, "message": "Email is already registered"}), 400
        
        # Validate passwords match
        password = request.form.get('password')
        confirm_password = request.form.get('confirmPassword')
        if not password:
            return jsonify({"success": False, "message": "Password is required"}), 400
            
        if password != confirm_password:
            return jsonify({"success": False, "message": "Passwords do not match"}), 400
        
        # Prepare user data
        user_data = {
            'fullName': request.form.get('fullName', ''),
            'email': email,
            'phone': request.form.get('phone', ''),
            'location': request.form.get('location', ''),
            'styling': request.form.get('styling', 'no'),
            'stylePreference': request.form.get('stylePreference', ''),
            'password': password,
            'photoData': request.form.get('photoData', '')
        }
        
        # Create the user
        user_id = create_user(user_data)
        
        if user_id is None:
            return jsonify({"success": False, "message": "Failed to create user. Please check database connection."}), 500
        
        # Log the user in
        session['user_id'] = str(user_id)
        session['email'] = email
        session['name'] = user_data['fullName']
        
        # Include explicit redirect to /home
        return jsonify({
            "success": True, 
            "message": "Registration successful",
            "redirect": "/home"
        })
    except Exception as e:
        app.logger.error(f"Error in registration: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500

@app.route('/login', methods=['POST'])
def login():
    """Handle user login"""
    try:
        email = request.form.get('email')
        password = request.form.get('password')
        remember = True if request.form.get('rememberMe') else False
        
        if not email or not password:
            return jsonify({"success": False, "message": "Email and password are required"}), 400
        
        success, message = login_user(email, password, remember)
        
        if success:
            # Include explicit redirect to /home
            return jsonify({
                "success": True, 
                "message": message,
                "redirect": "/home"
            })
        else:
            return jsonify({"success": False, "message": message}), 401
    except Exception as e:
        app.logger.error(f"Error during login: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"success": False, "message": "Login failed due to an error"}), 500

@app.route('/logout')
def logout():
    """Log out the current user"""
    session.clear()
    return redirect(url_for('home'))

# User profile routes
@app.route('/profile')
@login_required
def profile():
    """Show user profile"""
    db = get_db()
    if db is None:
        flash("Database connection error", "error")
        return redirect(url_for('home_page'))
    
    user_id = ObjectId(session['user_id'])
    user = db.users.find_one({"_id": user_id})
    
    if not user:
        session.clear()
        flash("User not found. Please login again.", "error")
        return redirect(url_for('login_page'))
    
    return render_template('style_test.html', user=user)

@app.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    """Update user profile"""
    db = get_db()
    if db is None:
        return jsonify({"success": False, "message": "Database connection error"}), 500
    
    user_id = ObjectId(session['user_id'])
    
    # Prepare update data
    update_data = {
        'fullName': request.form.get('fullName'),
        'phone': request.form.get('phone'),
        'location': request.form.get('location'),
        'styling': request.form.get('styling'),
        'stylePreference': request.form.get('stylePreference'),
    }
    
    # Handle profile image update
    photo_data = request.form.get('photoData')
    if photo_data:
        image_path = save_profile_image(photo_data)
        if image_path:
            update_data['profile_image'] = image_path
    
    # Update the user
    result = db.users.update_one(
        {"_id": user_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        return jsonify({"success": False, "message": "No changes made"}), 400
    
    # Update session data
    session['name'] = update_data['fullName']
    
    return jsonify({"success": True, "message": "Profile updated successfully"})

@app.route('/api/news')
def get_news():
    db = get_db()
    if db is None:
        app.logger.error("Cannot connect to MongoDB")
        return jsonify([])
    try:
        news_collection = db.news
        news_items = list(news_collection.find().sort('date', -1).limit(10))
        for item in news_items:
            item['_id'] = str(item['_id'])
        return jsonify(news_items)
    except Exception as e:
        app.logger.error(f"Error fetching news: {e}")
        return jsonify([])

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')

@app.route('/run-scraper')
def run_scraper():
    try:
        # Change this line to import from the services folder
        from services.scraper import scrape_vogue_india_fashion
        results = scrape_vogue_india_fashion()
        return jsonify({"status": "success", "message": f"Scraped {results} new articles from Vogue India Fashion"})
    except Exception as e:
        error_details = traceback.format_exc()
        app.logger.error(f"Error running scraper: {error_details}")
        return jsonify({"status": "error", "message": str(e), "traceback": error_details}), 500

@app.route('/debug')
def debug_info():
    debug_info = {
        "time": str(datetime.datetime.now()),
        "mongodb_status": "Unknown",
        "error": None
    }
    try:
        db = get_db()
        if db is None:
            debug_info["mongodb_status"] = "Failed to connect"
            return jsonify(debug_info)
        client = db.client
        server_info = client.server_info()
        debug_info["mongodb_status"] = "Connected"
        debug_info["mongodb_version"] = server_info.get("version", "Unknown")
        news_count = db.news.count_documents({})
        debug_info["news_count"] = news_count
        if news_count > 0:
            sample_news = []
            for item in db.news.find().sort('date', -1).limit(3):
                sample_news.append({
                    "title": item.get("title", "No Title"),
                    "image_url": item.get("image_url", ""),
                    "excerpt": item.get("excerpt", "")[:100] + "...",
                    "date": str(item.get("date", ""))
                })
            debug_info["sample_news"] = sample_news
    except Exception as e:
        debug_info["mongodb_status"] = "Error"
        debug_info["error"] = str(e)
        debug_info["traceback"] = traceback.format_exc()
    return jsonify(debug_info)

@app.route('/placeholder')
def placeholder():
    return render_template('placeholder.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({"response": "Please enter a message"}), 400
    
    # Basic fashion Q&A responses - just use hardcoded responses
    fashion_responses = {
        "trending": "Current fashion trends include oversized silhouettes, sustainable fashion, and vintage revival pieces.",
        "sustainable": "Sustainable fashion focuses on environmentally friendly materials and ethical production processes. Look for brands that use organic cotton, recycled materials, and transparent supply chains.",
        "summer": "For summer fashion, lightweight natural fabrics like linen and cotton are ideal. Flowy dresses, shorts, and breathable tops in bright colors or pastels are popular choices.",
        "winter": "Winter fashion essentials include layering pieces, quality knitwear, and a good coat. Think turtlenecks, wool sweaters, thermal leggings, and waterproof boots.",
        "accessories": "Statement accessories can transform any outfit. Consider bold earrings, layered necklaces, or a quality handbag as investment pieces.",
        "colors": "This season's color palette includes earthy tones like terracotta and olive, alongside vibrant pops of color like electric blue and fuchsia.",
        "dress": "When choosing a dress, consider the occasion, your body type, and your personal style. A well-fitted dress can make you feel confident and look your best.",
        "outfit": "The key to a great outfit is balance - mix fitted pieces with looser ones, and don't forget that confidence is your best accessory!",
        "jeans": "A good pair of jeans should fit well at the waist and hips. Dark wash jeans tend to be more versatile and can be dressed up or down.",
        "shoes": "Invest in a few quality pairs of shoes that are both comfortable and versatile. A good pair of white sneakers, ankle boots, and formal shoes are essentials.",
        "formal": "For formal events, classic choices never go out of style. Consider a well-fitted suit or an elegant dress in a timeless color like black, navy, or burgundy."
    }
    
    # Log chat for analytics
    if 'user_id' in session:
        try:
            db = get_db()
            if db is not None:
                db.chat_logs.insert_one({
                    'user_id': session['user_id'],
                    'message': user_message,
                    'timestamp': datetime.datetime.now()
                })
        except Exception as e:
            app.logger.error(f"Error logging chat: {e}")
    
    # Check if we can provide a basic response
    for keyword, response in fashion_responses.items():
        if keyword in user_message.lower():
            app.logger.info(f"Matched keyword '{keyword}', sending predefined response")
            return jsonify({"response": response})
    
    # Default response if no keywords match
    default_response = (
        "I'm here to help with fashion advice. You can ask me about trends, styling tips, "
        "or specific items like dresses, shoes, or accessories. How can I assist you today?"
    )
    
    return jsonify({"response": default_response})

# Scrapbook functionality from paste.txt
@app.route('/journals')
def journals_index():
    db = get_db()
    if db is None:
        flash("Database connection error. Please try again later.", "error")
        return render_template('journals_index.html', journals=[])
    
    try:
        journals = list(db.journals.find())
        return render_template('journals_index.html', journals=journals)
    except Exception as e:
        app.logger.error(f"Error fetching journals: {e}")
        flash("Error fetching journals. Please try again later.", "error")
        return render_template('journals_index.html', journals=[])

@app.route('/create_journal', methods=['POST'])
def create_journal():
    journal_name = request.form['journal_name'].strip()
    if not journal_name:
        flash("Journal name cannot be empty.", "error")
        return redirect(url_for('journals_index'))
        
    safe_name = secure_filename(journal_name.replace(" ", "_"))
    
    db = get_db()
    if db is None:
        flash("Database connection error. Please try again later.", "error")
        return redirect(url_for('journals_index'))
    
    try:
        existing = db.journals.find_one({"name": safe_name})
        if existing:
            flash(f"A journal named '{journal_name}' already exists.", "error")
            return redirect(url_for('journals_index'))
            
        db.journals.insert_one({
            "name": safe_name,
            "display_name": journal_name,
            "created_at": datetime.datetime.now()
        })
        flash(f"Journal '{journal_name}' created successfully!", "success")
        return redirect(url_for('view_scrapbook', journal=safe_name))
    except Exception as e:
        app.logger.error(f"Error creating journal: {e}")
        flash("Error creating journal. Please try again later.", "error")
        return redirect(url_for('journals_index'))

@app.route('/scrapbook')
def scrapbook():
    return redirect(url_for('journals_index'))

@app.route('/scrapbook/<journal>')
def view_scrapbook(journal):
    db = get_db()
    if db is None:
        flash("Database connection error. Please try again later.", "error")
        return redirect(url_for('journals_index'))
    
    try:
        # Debug log
        app.logger.info(f"Looking for journal with name: {journal}")
        
        # Find the journal document
        journal_doc = db.journals.find_one({"name": journal})
        if not journal_doc:
            # Additional logging for debugging
            app.logger.error(f"Journal '{journal}' not found in database")
            
            # List all available journals for debugging
            all_journals = list(db.journals.find({}, {"name": 1, "display_name": 1}))
            journal_names = [j.get('name') for j in all_journals]
            app.logger.info(f"Available journals: {journal_names}")
            
            flash(f"Journal '{journal}' does not exist.", "error")
            return redirect(url_for('journals_index'))

        # Get all images for this journal
        images = list(db.images.find({"journal_name": journal}))
        view_mode = request.args.get('mode', 'standard')
        
        # Get the display name and the internal name
        display_name = journal_doc.get('display_name', journal)
        internal_name = journal_doc.get('name', journal)
        
        app.logger.info(f"Found journal. Display name: {display_name}, Internal name: {internal_name}")
        
        if view_mode == 'flipbook' and images:
            return render_template('scrapbook_flipbook.html', 
                                images=images, 
                                journal=display_name,
                                journal_name=internal_name)
        else:
            return render_template('scrapbook_standard.html', 
                                images=images, 
                                journal=display_name,  # This is for display purposes
                                journal_name=internal_name)  # This is for URLs and data attributes
    except Exception as e:
        app.logger.error(f"Error viewing scrapbook: {e}")
        app.logger.error(traceback.format_exc())  # Log the full stack trace
        flash("Error loading scrapbook. Please try again later.", "error")
        return redirect(url_for('journals_index'))

@app.route('/upload/<journal>', methods=['POST'])
def upload_to_journal(journal):
    db = get_db()
    if db is None:
        flash("Database connection error. Please try again later.", "error")
        return redirect(url_for('view_scrapbook', journal=journal))
    
    journal_doc = db.journals.find_one({"name": journal})
    if not journal_doc:
        flash(f"Journal '{journal}' does not exist.", "error")
        return redirect(url_for('journals_index'))
    
    if 'image' not in request.files:
        flash("No file part", "error")
        return redirect(url_for('view_scrapbook', journal=journal))
        
    file = request.files['image']
    caption = request.form.get('caption', '')
    
    if file.filename == '':
        flash("No selected file", "error")
        return redirect(url_for('view_scrapbook', journal=journal))
    
    if file and allowed_file(file.filename):
        try:
            filename = secure_filename(file.filename)
            timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"{timestamp}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            file.save(file_path)
            
            db.images.insert_one({
                "journal_name": journal,
                "filename": filename,
                "filepath": f"uploads/{filename}",  # Use consistent forward slashes for web paths
                "caption": caption,
                "uploaded_at": datetime.datetime.now()
            })
            
            flash("Image uploaded successfully!", "success")
        except Exception as e:
            app.logger.error(f"Error saving file: {e}")
            flash("Error uploading image. Please try again.", "error")
    else:
        flash("Allowed file types are: png, jpg, jpeg, gif", "error")
    
    view_mode = 'standard'
    referer = request.referrer
    if referer and 'mode=flipbook' in referer:
        view_mode = 'flipbook'
    
    return redirect(url_for('view_scrapbook', journal=journal, mode=view_mode))

@app.route('/upload/<journal>/js', methods=['POST'])
def js_upload_to_journal(journal):
    db = get_db()
    if db is None:
        app.logger.error("Database connection failed in JS upload")
        return jsonify({"error": "Database connection error"}), 500
    
    journal_doc = db.journals.find_one({"name": journal})
    if not journal_doc:
        app.logger.error(f"Journal '{journal}' not found in JS upload")
        return jsonify({"error": f"Journal '{journal}' does not exist"}), 404
    
    if 'file' not in request.files:
        app.logger.error("No file part in JS upload request")
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        app.logger.error("Empty filename in JS upload")
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        try:
            filename = secure_filename(file.filename)
            timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"{timestamp}_{filename}"
            
            # Ensure upload directory exists
            upload_dir = os.path.join('static', 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            
            file_path = os.path.join(upload_dir, filename)
            app.logger.info(f"Attempting to save file to: {file_path}")
            
            # Save the file
            file.save(file_path)
            app.logger.info(f"File saved successfully to: {file_path}")
            
            # Insert into MongoDB
            db.images.insert_one({
                "journal_name": journal,
                "filename": filename,
                "filepath": f"uploads/{filename}",
                "caption": "",
                "uploaded_at": datetime.datetime.now()
            })
            app.logger.info(f"MongoDB entry created for: {filename}")
            
            return jsonify({
                "success": True, 
                "filename": filename,
                "filepath": f"uploads/{filename}"
            })
        except Exception as e:
            app.logger.error(f"Error in JS upload: {str(e)}")
            app.logger.error(traceback.format_exc())  # This will log the full stack trace
            return jsonify({"error": str(e)}), 500
    else:
        app.logger.error(f"Invalid file type in JS upload: {file.filename}")
        return jsonify({"error": "Invalid file type"}), 400
    
@app.route('/delete/<journal>/<filename>', methods=['POST'])
def delete_image(journal, filename):
    db = get_db()
    if db is None:
        flash("Database connection error. Please try again later.", "error")
        return redirect(url_for('view_scrapbook', journal=journal))
    
    try:
        image = db.images.find_one({"journal_name": journal, "filename": filename})
        if not image:
            flash("Image not found.", "error")
            return redirect(url_for('view_scrapbook', journal=journal))
        
        db.images.delete_one({"journal_name": journal, "filename": filename})
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        flash("Image deleted successfully.", "success")
    except Exception as e:
        app.logger.error(f"Error deleting image: {e}")
        flash("Error deleting image. Please try again later.", "error")
    
    view_mode = 'standard'
    referer = request.referrer
    if referer and 'mode=flipbook' in referer:
        view_mode = 'flipbook'
    
    return redirect(url_for('view_scrapbook', journal=journal, mode=view_mode))

# Add these routes to app.py

# Route to save style test results with improved implementation
@app.route('/save_style_test', methods=['POST'])
def save_style_test():
    try:
        # Get request data
        data = request.json
        
        # Validate required fields
        required_fields = ['styleCode', 'boldSubtle', 'structuredFlowing', 'classicInnovative', 'minimalExpressive']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "message": f"Missing required field: {field}"}), 400
        
        # Check if user is logged in
        if 'user_id' not in session:
            # Create a temporary anonymous session id if not logged in
            if 'anonymous_id' not in session:
                session['anonymous_id'] = str(ObjectId())
            user_identifier = session['anonymous_id']
            is_anonymous = True
        else:
            user_identifier = session['user_id']
            is_anonymous = False
        
        # Add user info and timestamp
        test_data = {
            'user_id': user_identifier,
            'is_anonymous': is_anonymous,
            'styleCode': data['styleCode'],
            'boldSubtle': data['boldSubtle'],
            'structuredFlowing': data['structuredFlowing'],
            'classicInnovative': data['classicInnovative'],
            'minimalExpressive': data['minimalExpressive'],
            'answers': data.get('answers', []),
            'updated_at': datetime.datetime.now()
        }
        
        # Connect to database
        db = get_db()
        if db is None:
            return jsonify({"success": False, "message": "Database connection error"}), 500
        
        # Check if there's an existing test result for this user
        existing_result = db.style_tests.find_one({"user_id": user_identifier})
        
        if existing_result:
            # Update existing record
            result = db.style_tests.update_one(
                {"user_id": user_identifier},
                {"$set": test_data}
            )
            success = result.modified_count > 0
        else:
            # Create new record
            test_data['created_at'] = datetime.datetime.now()
            result = db.style_tests.insert_one(test_data)
            success = result.inserted_id is not None
        
        # If the user is logged in, also associate the result with their profile
        if not is_anonymous:
            db.users.update_one(
                {"_id": ObjectId(user_identifier)},
                {"$set": {
                    "style_profile": {
                        "styleCode": data['styleCode'],
                        "boldSubtle": data['boldSubtle'],
                        "structuredFlowing": data['structuredFlowing'],
                        "classicInnovative": data['classicInnovative'],
                        "minimalExpressive": data['minimalExpressive'],
                        "updated_at": datetime.datetime.now()
                    }
                }}
            )
            
            # Also add to the activity log
            try:
                db.user_activities.insert_one({
                    'user_id': user_identifier,
                    'activity_type': 'style_test_completed',
                    'details': {
                        'styleCode': data['styleCode']
                    },
                    'created_at': datetime.datetime.now()
                })
            except Exception as e:
                app.logger.error(f"Error logging style test activity: {str(e)}")
        
        return jsonify({
            "success": success,
            "message": "Style test results saved successfully" if success else "Failed to save results"
        })
    
    except Exception as e:
        app.logger.error(f"Error saving style test results: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500

# Route to get style test results with improved implementation
@app.route('/get_style_test', methods=['GET'])
def get_style_test():
    try:
        # Check if user is logged in or has anonymous ID
        if 'user_id' in session:
            user_identifier = session['user_id']
        elif 'anonymous_id' in session:
            user_identifier = session['anonymous_id']
        else:
            return jsonify({"success": False, "message": "No user session found"}), 404
        
        # Connect to database
        db = get_db()
        if db is None:
            return jsonify({"success": False, "message": "Database connection error"}), 500
        
        # Find the test result for this user
        test_result = db.style_tests.find_one({"user_id": user_identifier})
        
        if test_result:
            # Convert ObjectId to string for JSON serialization
            test_result['_id'] = str(test_result['_id'])
            
            # Get additional style information if available
            style_code = test_result.get('styleCode')
            if style_code:
                # Log that result was found
                app.logger.info(f"Style test results found for user: {user_identifier}, style code: {style_code}")
            
            return jsonify({
                "success": True,
                "results": test_result
            })
        else:
            return jsonify({"success": False, "message": "No test results found for this user"}), 404
    
    except Exception as e:
        app.logger.error(f"Error retrieving style test results: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500

# Route to clear style test results with improved implementation
@app.route('/clear_style_test', methods=['POST'])
def clear_style_test():
    try:
        # Check if user is logged in or has anonymous ID
        if 'user_id' in session:
            user_identifier = session['user_id']
        elif 'anonymous_id' in session:
            user_identifier = session['anonymous_id']
        else:
            return jsonify({"success": False, "message": "No user session found"}), 404
        
        # Connect to database
        db = get_db()
        if db is None:
            return jsonify({"success": False, "message": "Database connection error"}), 500
        
        # Delete the test results for this user
        result = db.style_tests.delete_one({"user_id": user_identifier})
        
        # If the user is logged in, also remove style profile from user document
        if 'user_id' in session:
            db.users.update_one(
                {"_id": ObjectId(user_identifier)},
                {"$unset": {"style_profile": ""}}
            )
            
            # Log the action
            try:
                db.user_activities.insert_one({
                    'user_id': user_identifier,
                    'activity_type': 'style_test_cleared',
                    'created_at': datetime.datetime.now()
                })
            except Exception as e:
                app.logger.error(f"Error logging style test clear activity: {str(e)}")
        
        return jsonify({
            "success": result.deleted_count > 0,
            "message": "Style test results cleared successfully" if result.deleted_count > 0 else "No results found to clear"
        })
    
    except Exception as e:
        app.logger.error(f"Error clearing style test results: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500

@app.route('/api/markets', methods=['GET', 'POST'])
def handle_markets():
    db = get_db()
    if db is None:
        return jsonify({"success": False, "message": "Database connection error"}), 500
    
    if request.method == 'GET':
        try:
            markets = list(db.markets.find({}, {'_id': 0}))
            return jsonify(markets)
        except Exception as e:
            app.logger.error(f"Error fetching markets: {e}")
            return jsonify([])
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            app.logger.info(f"Received market data: {data}")
            
            # Basic validation for required fields - removed 'state' from required fields
            required_fields = ['name', 'category', 'price_range', 'best_for', 'location']
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({"success": False, "message": f"Missing required field: {field}"}), 400
            
            # Ensure location structure is correct
            if 'coordinates' not in data['location'] or len(data['location']['coordinates']) != 2:
                return jsonify({"success": False, "message": "Invalid location coordinates"}), 400
            
            # Set defaults for optional fields
            if 'city' not in data or not data['city']:
                data['city'] = "Other"
            
            if 'state' not in data or not data['state']:
                data['state'] = "Other"
                
            if 'country' not in data or not data['country']:
                data['country'] = "India"
            
            if 'area' not in data:
                data['area'] = ""
            
            # Add timestamp
            data['created_at'] = datetime.datetime.now()
            data['updated_at'] = datetime.datetime.now()
            
            # Insert into database
            result = db.markets.insert_one(data)
            
            return jsonify({
                "success": True,
                "message": "Market added successfully",
                "market_id": str(result.inserted_id)
            })
        except Exception as e:
            app.logger.error(f"Error adding market: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
        
with app.app_context():
    db = get_db()
    if db is not None:  # Changed from 'if db:' to 'if db is not None:'
        db.markets.create_index([("location", "2dsphere")])

if __name__ == '__main__':
    # Test database connection
    db = get_db()
    if db is None:
        print("[WARNING] Failed to connect to MongoDB - user authentication and data storage will not work")
    else:
        print("Successfully connected to MongoDB")
        
        # Ensure indexes for performance
        try:
            db.users.create_index("email", unique=True)
            print("Database indexes created successfully")
        except Exception as e:
            print(f"[WARNING] Error creating indexes: {e}")
    
    # Run the app
    app.run(debug=True)