import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const session_id = localStorage.getItem("session_id");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/cart",  {
      headers: {
        Authorization: `Bearer ${session_id}`,
      },
    })
      .then((response) => {
        setCartItems(response.data);
      })
      .catch((error) => {
        console.error("Failed to retrieve cart data", error);
      });
  }, [session_id]);

  const removeFromCart = (itemId) => {
    axios.delete(`http://127.0.0.1:5000/cart/${itemId}`,  {
      headers: {
        Authorization: `Bearer ${session_id}`,
      },
    })
      .then(() => {
        setCartItems(cartItems.filter((item) => item.id !== itemId));
      })
      .catch((error) => {
        console.error("Failed to remove item from cart", error);
      });
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace("$", ""));
      return total + price;
    }, 0);
  };

  // Generate share link
  const generateShareLink = () => {
    const cartData = cartItems.map(item => `id=${item.id}&name=${encodeURIComponent(item.name)}`).join("&");
    const shareURL = `${window.location.origin}/share?${cartData}`;
    navigate(shareURL);
  };

  return (
    <div className="cart-page">
      <header className="cart-header">
        <h1>Shopping Cart</h1>
        <p>Review the items you've added and proceed to checkout</p>
      </header>

      {cartItems.length === 0 ? (
        <p className="empty-cart-message">Your shopping cart is empty.</p>
      ) : (
        <div className="cart-content">
          <ul className="cart-item-list">
            {cartItems.map((item, index) => (
              <li key={index} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-info">
                  <h2 dangerouslySetInnerHTML={{ __html: item.name }} className="cart-item-name" />
                  <p className="cart-item-price">{item.price}</p>
                  <button onClick={() => removeFromCart(item.id)} className="remove-button">
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          

          <div className="cart-summary">
            <h2>Total Price: <span className="total-price">${calculateTotalPrice().toFixed(2)}</span></h2>
            <button className="checkout-button">Checkout</button>
          </div>
        </div>
      )}
      <button onClick={generateShareLink} className="share-cart-button">Share Cart</button>
    </div>
    
  );
}

export default CartPage;


