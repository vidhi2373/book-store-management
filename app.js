// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3100;


mongoose.connect('mongodb://127.0.0.1:27017/bookstore', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'views')));

app.use('/api', (req, res, next) => {
  
  next();
});


const Customer = mongoose.model('Customer', {
  customerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Book = mongoose.model('Book', {
  bookId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  quantity: { type: Number, default: 0 },
});

const Order = mongoose.model('Order', {
  customerId: { type: String, ref: 'Customer', required: true },
  bookId: { type: String, ref: 'Book', required: true },
  quantity: { type: Number, default: 1 },
});


app.get('/', (req, res) => {
  if (isLoggedIn) {
    return res.redirect('/dashboard'); 
  }
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});


app.post('/api/customers', async (req, res) => {
  const { customerId, name, email, password } = req.body;

  try {
    const newCustomer = new Customer({ customerId, name, email, password });
    const savedCustomer = await newCustomer.save();
    res.json(savedCustomer);
  } catch (err) {
    errorHandler(err, req, res);
  }
});


app.post('/api/login', async (req, res) => {
  const { customerId, password } = req.body;

  try {
    const customer = await Customer.findOne({ customerId });

    if (!customer || customer.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    res.json({ success: true, message: 'Login successful.' });
  } catch (err) {
    errorHandler(err, req, res);
  }
});


app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    errorHandler(err, req, res);
  }
});



app.post('/api/books', async (req, res) => {
  const { bookId, title, author, genre, quantity } = req.body;

  try {
    console.log('Received request to add/update book:', req.body);


    const existingBook = await Book.findOne({ bookId });

    if (existingBook) {
 
      const updatedBook = await Book.findOneAndUpdate({ bookId }, { title, author, genre, quantity }, { new: true });

      if (!updatedBook) {
        console.error('Failed to update the book.');
        return res.status(500).json({ success: false, message: 'Failed to update the book.' });
      }

      console.log('Book updated successfully:', updatedBook);
      res.json({ success: true, message: 'Book updated successfully!', book: updatedBook });
    } else {
  
      const newBook = new Book({ bookId, title, author, genre, quantity });
      const savedBook = await newBook.save();

      if (!savedBook) {
        console.error('Failed to add the new book.');
        return res.status(500).json({ success: false, message: 'Failed to add the new book.' });
      }

      console.log('Book added successfully:', savedBook);
      res.json({ success: true, message: 'Book added successfully!', book: savedBook });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});






app.post('/api/orders', async (req, res) => {
  const { customerId, bookId, quantity } = req.body;

  try {
    
    const customer = await Customer.findOne({ customerId });
    const book = await Book.findOne({ bookId });

    if (!customer || !book) {
      return res.status(404).json({ success: false, message: 'Customer or book not found.' });
    }


    if (book.quantity < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock available.' });
    }


    const newOrder = new Order({ customerId, bookId, quantity });
    const savedOrder = await newOrder.save();


    book.quantity -= quantity;
    await book.save();

    res.json({ success: true, order: savedOrder });
  } catch (err) {
    errorHandler(err, req, res);
  }
});


app.get('/api/customer/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;

    const customer = await Customer.findOne({ customerId });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const orders = await Order.find({ customerId });


    res.json({ success: true, customer, orders });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});





const errorHandler = (err, req, res) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
};

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});