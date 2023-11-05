// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyARMXuepHGtY8Zvz0M7jNwkL9LOC7Op7FA',
	authDomain: 's11elo.firebaseapp.com',
	projectId: 's11elo',
	storageBucket: 's11elo.appspot.com',
	messagingSenderId: '44045651841',
	appId: '1:44045651841:web:0dff7c40961d0196a5e280'
};

// Initialize Firebase
export function firebaseInit() {
	initializeApp(firebaseConfig);
}
