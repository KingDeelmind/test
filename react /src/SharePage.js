import React, { useEffect, useState } from "react";
import "./SharePage.css"; // Import stylesheet

function SharePage() {
  const [sharedItems, setSharedItems] = useState([]);

  useEffect(() => {
    // Parse URL query parameters
    const params = new URLSearchParams(window.location.search);
    const items = [];

    // Iterate over all parameters
    for (const [key, value] of params.entries()) {
      if (key === "id" || key === "name") {
        items.push({ key, value });
      }
    }
    setSharedItems(items);
  }, []);

  return (
    <div className="share-page">
      <header className="share-header">
        <h1>Shared Shopping Cart</h1>
        <p>The following are the items in your shared shopping cart:</p>
      </header>

      <ul className="shared-item-list">
        {sharedItems.length > 0 ? (
          sharedItems.map((item, index) => (
            <li key={index} className="shared-item">
              <img
                src={`https://via.placeholder.com/100?text=Product+${item.key}`} 
                alt={`Product ${item.key}`}
                className="shared-item-image"
              />
              <div className="shared-item-info">
                {/* Use dangerouslySetInnerHTML to render the parameter */}
                <div dangerouslySetInnerHTML={{ __html: `${item.key}: ${item.value}` }} className="shared-item-content" />
              </div>
            </li>
          ))
        ) : (
          <p className="empty-cart-message">Your shopping cart is empty.</p>
        )}
      </ul>
    </div>
  );
}

export default SharePage;