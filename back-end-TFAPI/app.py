from website import create_app

"""
Create and run the Flask application.

This script serves as the entry point for the Flask application. It imports the 'create_app'
function from the 'website' module to create the Flask application instance. If this script
is executed directly (not imported as a module), it runs the application with debugging turned
off.
"""

app = create_app()

if __name__ == '__main__':
    app.run(debug=False)
