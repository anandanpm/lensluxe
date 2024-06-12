// module.exports = function(invoiceData) {
//   // Check if invoiceData is defined and has an orders property
//   if (!invoiceData || !invoiceData.orders || !Array.isArray(invoiceData.orders)) {
//     return '<html><body><h1>Invalid Invoice Data</h1></body></html>';
//   }

//   const html = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <meta charset="UTF-8">
//         <title>Invoice</title>
//         <style>
//           /* CSS styles for the invoice */
//           body {
//             font-family: Arial, sans-serif;
//             font-size: 14px;
//           }
//           table {
//             width: 100%;
//             border-collapse: collapse;
//           }
//           th, td {
//             padding: 8px;
//             text-align: left;
//             border-bottom: 1px solid #ddd;
//           }
//           th {
//             background-color: #f2f2f2;
//           }
//         </style>
//       </head>
//       <body>
//         <h1>Invoice</h1>
//         <table>
//           <thead>
//             <tr>
//               <th>Order Date</th>
//               <th>Payment Method</th>
//               <th>Payment Status</th>
//               <th>Shipping Address</th>
//               <th>Product Status</th>
//               <th>Product Image</th>
//               <th>Product Name</th>
//               <th>Quantity</th>
//               <th>Price</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${invoiceData.orders.map(order => `
//               ${order.items ? order.items.map(item => `
//                 <tr>
//                   <td>${new Date(order.orderDate).toDateString()}</td>
//                   <td>${order.paymentMethod || ''}</td>
//                   <td>${order.paymentStatus || ''}</td>
//                   <td>${order.shippingAddress ? order.shippingAddress.trim().replace(/\n+/g, ', ') : ''}</td>
//                   <td>${item.Status || ''}</td>
//                   <td><img src="${item.image && item.image[0] ? item.image[0] : ''}" alt="${item.title || ''}" style="max-height: 50px;"></td>
//                   <td>${item.title || ''}</td>
//                   <td>${item.quantity || ''}</td>
//                   <td>${item.price || ''}</td>
//                 </tr>
//               `).join('') : ''}
//             `).join('')}
//           </tbody>
//         </table>
//         <div>
//           <p>Total Amount: ${invoiceData.totalAmount || 0}</p>
         
         
//         </div>
//       </body>
//     </html>
//   `;

//   return html;
// };

module.exports = function(invoiceData) {
  // Check if invoiceData is defined and has an orders property
  if (!invoiceData || !invoiceData.orders || !Array.isArray(invoiceData.orders)) {
    return '<html><body><h1>Invalid Invoice Data</h1></body></html>';
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice</title>
        <style>
          /* CSS styles for the invoice */
          body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .container {
            width: 80%;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
          }
          .details, .items, .total {
            margin-bottom: 20px;
          }
          .details table, .items table, .total table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .details th, .details td, .items th, .items td, .total th, .total td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
          }
          .details th, .items th, .total th {
            background-color: #f2f2f2;
          }
          .items img {
            max-height: 50px;
          }
          .total {
            text-align: right;
          }
          .total td {
            padding-right: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invoice</h1>
          </div>
          <div class="details">
            <h2>Order Details</h2>
            ${invoiceData.orders.map(order => `
              <table>
                <tr>
                  <th>Order Date</th>
                  <td>${new Date(order.orderDate).toDateString()}</td>
                </tr>
                <tr>
                  <th>Payment Method</th>
                  <td>${order.paymentMethod || ''}</td>
                </tr>
                <tr>
                  <th>Payment Status</th>
                  <td>${order.paymentStatus || ''}</td>
                </tr>
                <tr>
                  <th>Shipping Address</th>
                  <td>${order.shippingAddress ? order.shippingAddress.trim().replace(/\n+/g, ', ') : ''}</td>
                </tr>
              </table>
            `).join('')}
          </div>
          <div class="items">
            <h2>Items</h2>
            ${invoiceData.orders.map(order => `
              <table>
                <thead>
                  <tr>
                    <th>Product Status</th>
                    <th>Product Image</th>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items ? order.items.map(item => `
                    <tr>
                      <td>${item.Status || ''}</td>
                      <td><img src="${item.image && item.image[0] ? item.image[0] : ''}" alt="${item.title || ''}"></td>
                      <td>${item.title || ''}</td>
                      <td>${item.quantity || ''}</td>
                      <td>${item.price || ''}</td>
                      <td>${(item.quantity * item.price) || 0}</td>
                    </tr>
                  `).join('') : ''}
                </tbody>
              </table>
            `).join('')}
          </div>
          <div class="total">
            <table>
              <tr>
                <th>Total Amount</th>
                <td>${invoiceData.totalAmount || 0}</td>
              </tr>
            </table>
          </div>
        </div>
      </body>
    </html>
  `;

  return html;
};
