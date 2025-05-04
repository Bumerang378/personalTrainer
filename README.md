# Personal Trainer Application

This repository contains the source code for the Personal Trainer application, a React-based user interface for managing customer and training data.

---

## Features

Here are the main features implemented in the application:

### Customer Management (Asiakkaiden Hallinta)

-   Shows a full list of customers from the website's data.
-   You can see and change customer information.
-   You can remove customer profiles.
-   You can add new training sessions for a customer.
-   Allows **sorting** the customer list by clicking on columns.
-   Allows **filtering** or **searching** the customer list to find specific customers.
-   You can **save customer data as a CSV file**, only saving the important info.

### Training Management (Harjoitusten Hallinta)

-   Shows a detailed list of all training sessions from the website's data.
-   Shows details for each training, like **who the customer is**.
-   Shows training dates and times in an easy-to-read format like `day.month.year hour:minute`.
-   You can **delete** individual training sessions.

### Calendar View (Kalenterinäkymä)

-   Shows scheduled trainings on a **calendar** (you can see it by day, week, or month).
-   Fits well into the calendar view to give you a full picture.

### Statistics (Tilastot)

-   Has a statistics page with a **chart** that shows how many minutes you spent on each type of training activity.
    (Made using a chart tool like Recharts, and maybe Lodash to handle the data.)

### User Interface (Käyttöliittymä)

-   Looks nice and is **easy to use**.
-   You can easily move between pages like Customers, Trainings, Calendar, and Statistics using links.

---

## Project Parts (OSA Breakdown)

The project was developed and is evaluated based on completion in several parts:

### Part 1 (Osa 1)

-   Successfully created the core React application.
-   Implemented separate list pages for customers and trainings.
-   Created the main navigation component for switching between pages.

### Part 2 (Osa 2)

-   Added the required CRUD (Create, Read, Update, Delete) functionalities for customer data on the customer list page (Adding new customers, Editing existing customers, Deleting customer profiles).
-   Added the required functionalities for training data on the training list page (Adding new training sessions for a customer, Deleting training sessions).
-   Implemented confirmation prompts for deletion actions as required.
-   Integrated a suitable component for entering the training date.

### Part 3 (Osa 3)

-   Implemented the **export functionality** to export customer data to a CSV file, with unnecessary information filtered out.
-   Implemented the **Calendar page** displaying scheduled training sessions in day, week, and month views.
-   Successfully **deployed the user interface** to a chosen cloud service.
-   Ensured the **customer's name is displayed** on the training list page for each training session.
-   Implemented the required **date and time formatting** (`dd.mm.yyyy hh:mm`) for the dates displayed in the training list table (e.g., using Dayjs or Date-fns).


### THE personalTrainer
- The final version of the project, encompassing all features and requirements from Parts 1-3
-   Implemented the **Statistics page**.
-   On the statistics page, added a **chart** visually representing the total duration (in minutes) for different training activity types. (Hinted libraries like Recharts for charting and Lodash for data processing were considered/used in the implementation).
-   This represents the **final, complete version** of the project with all functionalities integrated.


---

## API Documentation

The application fetches data from a REST API. The API documentation can be found here:
https://juhahinkula.github.io/personaltrainerdocs/

---

## Installation and Running Locally

To get a local copy up and running:

1.  Clone the repository:
    ```bash
    git clone [https://github.com/Bumerang378/personalTrainer.git](https://github.com/Bumerang378/personalTrainer.git)
    ```
2.  Navigate to the project directory:
    ```bash
    cd personalTrainer
    ```
3.  Install dependencies:
    ```bash
    npm install
    # or using yarn:
    # yarn install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    # or using yarn:
    # yarn dev
    # (Check your package.json scripts for the correct command, it might be 'npm start' or 'yarn start' for some setups)
    ```
5.  Open your browser and navigate to the address recommended by the terminal (usually `http://localhost:XXXX`).

---

## The application is deployed and can be accessed live at:
## https://bumerang378.github.io/personalTrainer/

---

## Screenshots
Asiakkaat
![image](https://github.com/user-attachments/assets/ff8f1f50-3ed0-4663-a15f-ed12f2e32d71)

Adding a new client
![image](https://github.com/user-attachments/assets/dcbbcae2-4bfc-4cff-9d71-fe2877f9b303)

Harjoitukset
![image](https://github.com/user-attachments/assets/aeb0fb99-2c67-4dc6-81e3-1228121937c3)

Adding a new training w/ example
![image](https://github.com/user-attachments/assets/13637dfa-70ac-406d-89dd-2ed105a8e351)

Kalenteri
![image](https://github.com/user-attachments/assets/82c5c6e8-0828-4e42-8dd9-7e34add3f9a1)

Tilastost
![image](https://github.com/user-attachments/assets/b54366bc-664e-48be-86a6-be0ed7bb975f)








---

Thank you for reviewing this project!
