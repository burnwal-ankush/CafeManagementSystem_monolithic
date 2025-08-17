import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
  DialogContent, TextField, DialogActions, IconButton, Grid,
  MenuItem, Box
} from '@mui/material';
import { Add, Delete, GetApp } from '@mui/icons-material';
import { billAPI, productAPI } from '../services/api';
import { toast } from 'react-toastify';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [billData, setBillData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    paymentMethod: 'Cash',
    productDetails: [],
    totalAmount: 0
  });
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchBills();
    fetchProducts();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await billAPI.getBills();
      setBills(response.data);
    } catch (error) {
      toast.error('Failed to fetch bills');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAllProducts();
      setProducts(response.data.filter(p => p.status === 'true'));
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const addProductToBill = () => {
    setSelectedProducts([...selectedProducts, { id: '', name: '', price: 0, quantity: 1, total: 0 }]);
  };

  const updateSelectedProduct = (index, field, value) => {
    const updated = [...selectedProducts];
    updated[index][field] = value;
    
    if (field === 'id') {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        updated[index].name = product.name;
        updated[index].price = product.price;
        updated[index].total = product.price * updated[index].quantity;
      }
    } else if (field === 'quantity') {
      updated[index].total = updated[index].price * value;
    }
    
    setSelectedProducts(updated);
    
    const totalAmount = updated.reduce((sum, item) => sum + item.total, 0);
    setBillData({ ...billData, totalAmount, productDetails: updated });
  };

  const removeProduct = (index) => {
    const updated = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updated);
    const totalAmount = updated.reduce((sum, item) => sum + item.total, 0);
    setBillData({ ...billData, totalAmount, productDetails: updated });
  };

  const handleSubmit = async () => {
    try {
      await billAPI.generateBill(billData);
      toast.success('Bill generated successfully');
      fetchBills();
      handleClose();
    } catch (error) {
      toast.error('Failed to generate bill');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setBillData({
      name: '',
      email: '',
      contactNumber: '',
      paymentMethod: 'Cash',
      productDetails: [],
      totalAmount: 0
    });
    setSelectedProducts([]);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await billAPI.deleteBill(id);
        toast.success('Bill deleted successfully');
        fetchBills();
      } catch (error) {
        toast.error('Failed to delete bill');
      }
    }
  };

  const downloadPdf = async (bill) => {
    try {
      const response = await billAPI.getPdf({ uuid: bill.uuid });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill-${bill.uuid}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bills
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Generate Bill
      </Button>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>UUID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>{bill.uuid}</TableCell>
                <TableCell>{bill.name}</TableCell>
                <TableCell>{bill.email}</TableCell>
                <TableCell>{bill.contactNumber}</TableCell>
                <TableCell>{bill.paymentMethod}</TableCell>
                <TableCell>${bill.totalAmount}</TableCell>
                <TableCell>
                  <IconButton onClick={() => downloadPdf(bill)}>
                    <GetApp />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(bill.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Generate Bill</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Customer Name"
                fullWidth
                variant="outlined"
                value={billData.name}
                onChange={(e) => setBillData({ ...billData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={billData.email}
                onChange={(e) => setBillData({ ...billData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Contact Number"
                fullWidth
                variant="outlined"
                value={billData.contactNumber}
                onChange={(e) => setBillData({ ...billData, contactNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Payment Method"
                select
                fullWidth
                variant="outlined"
                value={billData.paymentMethod}
                onChange={(e) => setBillData({ ...billData, paymentMethod: e.target.value })}
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Products</Typography>
            <Button onClick={addProductToBill} variant="outlined" sx={{ mb: 2 }}>
              Add Product
            </Button>
            
            {selectedProducts.map((item, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <TextField
                    select
                    label="Product"
                    fullWidth
                    value={item.id}
                    onChange={(e) => updateSelectedProduct(index, 'id', e.target.value)}
                  >
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name} - ${product.price}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Quantity"
                    type="number"
                    fullWidth
                    value={item.quantity}
                    onChange={(e) => updateSelectedProduct(index, 'quantity', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Price"
                    fullWidth
                    value={item.price}
                    disabled
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Total"
                    fullWidth
                    value={item.total}
                    disabled
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button onClick={() => removeProduct(index)} color="error">
                    Remove
                  </Button>
                </Grid>
              </Grid>
            ))}
            
            <Typography variant="h6" sx={{ mt: 2 }}>
              Total Amount: ${billData.totalAmount}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Generate Bill
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Bills;