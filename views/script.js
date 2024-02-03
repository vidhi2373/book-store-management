async function addCustomer() {
    try {
      const customerId = document.getElementById('customerId').value;
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId, name, email, password }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
  
      const result = await response.json();
      console.log(result);
      
     
      const successMessage = document.getElementById('successMessage');
      successMessage.innerHTML = 'Customer added successfully!';
      successMessage.style.color = 'green';
    } catch (error) {
      console.error(error);
      
     
      const errorMessage = document.getElementById('errorMessage');
      errorMessage.innerHTML = 'Error adding customer. Please try again.';
      errorMessage.style.color = 'red';
    }
  }
  async function getBooks() {
    try {
      const response = await fetch('/api/books');
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
  
      const books = await response.json();
  
      const booksResult = document.getElementById('booksResult');
      booksResult.innerHTML = '<h3>Books:</h3>';
  
      if (books.length === 0) {
        booksResult.innerHTML += '<p>No books available.</p>';
      } else {
        books.forEach(book => {
          booksResult.innerHTML += `<p>Book ID: ${book.bookId}, Title: ${book.title}, Author: ${book.author}, Genre: ${book.genre}, Quantity: ${book.quantity}</p>`;
        });
      }
    } catch (error) {
      console.error(error);
      const booksResult = document.getElementById('booksResult');
      booksResult.innerHTML = '<p>Error fetching books. Please try again.</p>';
    }
  }

  async function getCustomerData() {
    try {
      
      if (!isLoggedIn) {
        alert('Please log in to view customer data.');
        return;
      }
  
      const customerId = prompt('Enter Customer ID:');
  
      const response = await fetch(`/api/customer/${customerId}`);
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
  
      const result = await response.json();
  
      if (result.success) {
     
        alert(`Customer Data:\n${JSON.stringify(result.customer)}\n\nOrders:\n${JSON.stringify(result.orders)}`);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  }

  
  let isLoggedIn = false;
  let isAdmin = false;
  let adminPasswordEntered = false;
  
 
  function updateUI() {
    const addCustomerFormContainer = document.getElementById('addCustomerFormContainer');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const addBookFormContainer = document.getElementById('addBookFormContainer');
    const placeOrderFormContainer = document.getElementById('placeOrderFormContainer');
    const getBooksFormContainer = document.getElementById('getBooksFormContainer');
    const getOrdersContainer = document.getElementById('getOrdersContainer');
  
    if (isLoggedIn) {
      
      addCustomerFormContainer.style.display = 'none';
      loginFormContainer.style.display = 'none';
      placeOrderFormContainer.style.display = 'block';
      getBooksFormContainer.style.display = 'block';
      getOrdersContainer.style.display = 'block';
  
      if (isAdmin) {
        if (!adminPasswordEntered) {
          const adminPassword = prompt("confirm your  admin password:");
          if (adminPassword === '867400') { 
            adminPasswordEntered = true;
          } else {
            alert("Invalid admin password. Access denied.");
            addBookFormContainer.style.display = 'none';
          }
        } else {
          addBookFormContainer.style.display = 'block';
        }
      } else {
        addBookFormContainer.style.display = 'none';
      }
    } else {
     
      addCustomerFormContainer.style.display = 'block';
      loginFormContainer.style.display = 'block';
      addBookFormContainer.style.display = 'none';
      placeOrderFormContainer.style.display = 'none';
      getBooksFormContainer.style.display = 'none';
      getOrdersContainer.style.display = 'none';
    }
  }
  

  function setLoginStatus(status) {
    isLoggedIn = status;
    updateUI();
  }
  
  
  function setAdminStatus(status) {
    isAdmin = status;
    updateUI();
  }
async function login() {
  try {
    console.log('Login function started');

    const customerId = document.getElementById('loginCustomerId').value;
    const password = document.getElementById('loginPassword').value;

    console.log('Entered credentials:', customerId, password);


    const adminId = 'MUSKAN123';
    const adminPassword = '867400';

    if (customerId === adminId && password === adminPassword) {
  
      console.log('Admin login successful');
      setLoginStatus(true);
      setAdminStatus(true);
      updateUI(true);
    } else {
     
      console.log('Attempting regular login');

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId, password }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();

      console.log('Regular customer login result:', result);

      setLoginStatus(true);
      setAdminStatus(result.isAdmin);
      updateUI(result.isAdmin);  
    }
  } catch (error) {
    console.error(error);

    const errorMessage = document.getElementById('loginErrorMessage');
    errorMessage.innerHTML = 'Invalid login credentials. Please try again.';
    errorMessage.style.color = 'red';
  }
}

  

async function addBook() {
  try {
    console.log('addBook function started');

    const bookId = document.getElementById('bookId').value;
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const genre = document.getElementById('bookGenre').value;
    const quantity = document.getElementById('bookQuantity').value;

    console.log('Entered values:', bookId, title, author, genre, quantity);

    const response = await fetch('/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookId, title, author, genre, quantity }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Book added successfully:', result);

    // Provide feedback to the user (e.g., display a success message)
    const successMessage = document.getElementById('bookSuccessMessage');
    successMessage.innerHTML = 'Book added successfully!';
    successMessage.style.color = 'green';

    // Fetch and display the updated list of books
    getBooks();
  } catch (error) {
    console.error('Error adding book:', error);

    // Provide feedback to the user (e.g., display an error message)
    const errorMessage = document.getElementById('bookErrorMessage');
    errorMessage.innerHTML = 'Error adding book. Please try again.';
    errorMessage.style.color = 'red';
  }
}





async function placeOrder() {
  try {
    const customerId = document.getElementById('customerIdForOrder').value;
    const bookId = document.getElementById('bookIdForOrder').value;
    const quantity = document.getElementById('orderQuantity').value;

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId, bookId, quantity }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log(result);

    // Provide feedback to the user (e.g., display a success message)
    const successMessage = document.getElementById('orderSuccessMessage');
    successMessage.innerHTML = 'Order placed successfully!';
    successMessage.style.color = 'green';
  } catch (error) {
    console.error(error);

    // Provide feedback to the user (e.g., display an error message)
    const errorMessage = document.getElementById('orderErrorMessage');
    errorMessage.innerHTML = 'Error placing order. Please try again.';
    errorMessage.style.color = 'red';
  }
}
