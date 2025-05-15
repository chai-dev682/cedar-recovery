# Cedar Patient Medication Tracker

A FastAPI-based application for tracking patient medication information, featuring a modern web interface with full CRUD operations.

## Features

- Full CRUD operations (Create, Read, Update, Delete)
- Responsive design that works on all devices
- Modern UI with Bootstrap 5

## Installation

1. Clone the repository
2. Install the required dependencies:

```bash
cd cedar-app
pip install -r requirements.txt
```

## Running the Application

Start the application with:

```bash
python main.py
```

The application will be available at http://localhost:5000

## API Endpoints

- `GET /api/patients` - Get all patients
- `GET /api/patients/{patient_id}` - Get a specific patient
- `GET /api/patients/mri/{mri}` - Get a specific patient by mri
- `POST /api/patients` - Create a new patient
- `PUT /api/patients/{patient_id}` - Update a patient
- `DELETE /api/patients/{patient_id}` - Delete a patient

## Technologies Used

- FastAPI
- SQLAlchemy
- SQLite (for development)
- Bootstrap 5
- JavaScript (ES6+)
- HTML5 & CSS3

## License

MIT