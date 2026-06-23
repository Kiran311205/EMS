#!/bin/bash
# CoreHR Quick Setup Script
# Run from the corehr/ root directory

echo "========================================="
echo "  CoreHR — Employee Management System"
echo "========================================="
echo ""

echo "[1/4] Setting up Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate 2>/dev/null || venv\Scripts\activate
pip install -r requirements.txt --quiet
echo "  ✅ Python dependencies installed"

echo ""
echo "[2/4] Running Django migrations..."
echo "  ⚠️  Make sure you have updated .env with your DB credentials first!"
echo ""
python manage.py makemigrations accounts employees assets bank salary attendance leaves audit reports
python manage.py migrate
echo "  ✅ Database migrations complete"

echo ""
echo "[3/4] Creating superuser..."
echo "  You'll be prompted to enter username, email, and password."
python manage.py createsuperuser

echo ""
echo "[4/4] Setting up frontend..."
cd ../frontend
npm install --silent
echo "  ✅ Frontend dependencies installed"

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "  Start backend:  cd backend && python manage.py runserver"
echo "  Start frontend: cd frontend && npm run dev"
echo ""
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo "  Admin:    http://localhost:8000/admin/"
echo ""
