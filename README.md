INSTALL DEPENDENCIES
------------------------------------------------------------

You must install for BOTH server and client.

Install Backend:

    cd server
    npm install

Install Frontend:

    cd ../client
    npm install

------------------------------------------------------------
SETUP ENVIRONMENT FILE (IMPORTANT)
------------------------------------------------------------

Go inside the server folder.

On Windows:
    copy .env.example .env

On Mac/Linux:
    cp .env.example .env

Then open the .env file and make sure it contains:

    PORT=5000
    MONGO_URI=mongodb://localhost:27017/cims

If using MongoDB Atlas:
Replace MONGO_URI with your Atlas connection string.

------------------------------------------------------------
RUN THE APPLICATION
------------------------------------------------------------

You need TWO terminals open.

------------------------------------------------------------
Start Backend
------------------------------------------------------------

In first terminal:

    cd server
    npm run dev

You should see:
    API running on http://localhost:5000


------------------------------------------------------------
Start Frontend
------------------------------------------------------------

Open second terminal:

    cd client
    npm run dev

Open in browser:
    http://localhost:5173

------------------------------------------------------------
IMPORTANT RULES
------------------------------------------------------------

- Do NOT push .env files
- Do NOT push node_modules
- Always run "git pull" before starting work
- If new packages are added, run npm install again
