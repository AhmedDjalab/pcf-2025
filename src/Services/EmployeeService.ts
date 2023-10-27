// EmployeeService.ts

import "firebase/firestore";
import "firebase/auth";
import { app, auth } from "src/Helpers/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";

interface EmployeeData {
  id: string;
  fullName: string;
  email: string;
  password: string;
  canRead: boolean;
  canWrite: boolean;
  userId?: string;
  adminUserId: string;
}
const db = getFirestore(app);

const employeesCollection = collection(db, "employees");
//const auth = firebase.auth();

export const addEmployeeAndUser = async (
  employee: EmployeeData
): Promise<void> => {
  try {
    // Step 1: Create the user in Firebase Authentication
    const { email, password } = employee;
    const authUser = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Step 2: Remove the 'password' field before adding the employee data to Firestore
    const employeeDataWithoutPassword = {
      ...employee,
      userId: authUser.user.uid,
    };
    employeeDataWithoutPassword.password = "";

    // Step 3: Add the employee data to Firestore
    await addDoc(employeesCollection, employeeDataWithoutPassword);
  } catch (error) {
    console.error("Error adding employee and user: ", error);
  }
};

export const editEmployee = async (
  id: string,
  updatedEmployee: EmployeeData
): Promise<void> => {
  const employeesCollection = collection(db, "employees");
  const employeeQuery = query(employeesCollection, where("id", "==", id));
  const querySnapshot = await getDocs(employeeQuery);

  querySnapshot.forEach(async (docData: any) => {
    const employeeDoc = doc(employeesCollection, docData.id);
    const updatedData = {
      fullName: updatedEmployee.fullName,
      email: updatedEmployee.email,
      canRead: updatedEmployee.canRead,
      canWrite: updatedEmployee.canWrite,
    };
    await updateDoc(employeeDoc, updatedData);
  });
  console.log("Employee updated successfully");
};

export const deleteEmployeeAndUser = async (id: string): Promise<void> => {
  try {
    // Step 2: Delete the employee data from Firestore
    const employeesCollection = collection(db, "employees");
    const employeeQuery = query(employeesCollection, where("id", "==", id));
    const querySnapshot = await getDocs(employeeQuery);

    querySnapshot.forEach(async (docData: any) => {
      const employeeDoc = doc(employeesCollection, docData.id);
      await deleteDoc(employeeDoc);
    });
  } catch (error) {
    console.error("Error deleting employee and user: ", error);
  }
};

export const getEmployees = async (
  adminId: string
): Promise<EmployeeData[]> => {
  try {
    const employeesCollection = collection(db, "employees");
    const queryByAdminUserId = query(
      employeesCollection,
      where("adminUserId", "==", adminId)
    );
    const snapshot = await getDocs(queryByAdminUserId);
    const employees: EmployeeData[] = [];
    snapshot.forEach((doc) => {
      employees.push(doc.data() as EmployeeData);
    });
    return employees;
  } catch (error) {
    console.error("Error getting employees: ", error);
    return [];
  }
};
