import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./ProductPage.css";

// 商品数据
const products = [
  {
    id: 1,
    name: "Smart water cup",
    price: "$50.00",
    description: "This is a smart water cup that is suitable for people who pursue a healthy life.",
    image: "https://cbu01.alicdn.com/img/ibank/2018/874/280/8531082478_101075661.jpg",
  },
  {
    id: 2,
    name: "Wireless headset",
    price: "$150.00",
    description: "Comfortable wireless headphones, excellent sound quality, bring you the ultimate hearing experience.",
    image: "https://th.bing.com/th/id/OIP.RVJZ2Nmvn24ILGPA7vAeTQHaHa?w=189&h=189&c=7&r=0&o=5&pid=1.7",
  },
  {
    id: 3,
    name: "Portable coffee machine",
    price: "￥200.00",
    description: "Portable coffee machine, enjoy delicious coffee anytime, anywhere.",
    image: "https://th.bing.com/th/id/R.34304f2899cb6b682b74018710cadaaf?rik=32eSHNyKn0Vfdg&riu=http%3a%2f%2ffiles.toodaylab.com%2f2014%2f10%2fwacaco_minipresso_20141005211451_00.jpg&ehk=RAvIECHrWAmmdU38ds4ToOXxqVPwlJmo7g1g1qFtqeY%3d&risl=&pid=ImgRaw&r=0",
  },
];

function ProductPage() {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionId, setSessionId] = useState(null);
 

  // Get the session_id parameter in the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionParam = params.get("session_id");
    if (sessionParam) {
      setSessionId(sessionParam);
    }
    axios.get("http://127.0.0.1:5000/comments")
      .then((response) => {
        setReviews(response.data);
      })
      .catch((error) => {
        console.error("Failure to get comments", error);
      });
  }, [location.search]);

  // The function of submitting comments
  const handleAddReview = () => {
    if (newReview.trim()) {
      const reviewData = {
        content: newReview,
        date: new Date().toLocaleString(),
        user: "Anonymous user",
      };

      // Submit the comment to the back end
      axios.post("http://127.0.0.1:5000/comments", reviewData)
        .then(() => {
          setReviews([...reviews, reviewData]);
          setNewReview("");
        })
        .catch((error) => {
          console.error("Submit the comments failed", error);
        });
    }
  };

  // The function of adding goods to the shopping cart
  const addToCart = (product) => {
    const session_id = localStorage.getItem("session_id");

    axios.post("http://127.0.0.1:5000/cart", product, {
      headers: {
        Authorization: `Bearer ${session_id}`
      },
      withCredentials: true 
    })
    .then(() => {
      alert(`${product.name} Added to the shopping cart`);
    })
    .catch((error) => {
      console.error("Add to the shopping cart failed", error);
    });
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Online shopping mall</h1>
        <p>Discover high -quality products, improve the quality of life</p>
      </header>

      <button onClick={() => navigate("/cart")} className="view-cart-button">
        🛒 Check the shopping cart
      </button>

      <main>
        <section className="product-list">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} className="product-image" />
              <h2 className="product-name">{product.name}</h2>
              <p className="product-price">{product.price}</p>
              <p className="product-description">{product.description}</p>
              <button onClick={() => addToCart(product)} className="add-to-cart-button">
                🛒 add to the cart
              </button>
            </div>
          ))}
        </section>

        <section className="review-section">
          <h2>User review</h2>
          <div className="add-review">
            <textarea
              className="review-input"
              placeholder="Enter your comments..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
            ></textarea>
            <button className="submit-button" onClick={handleAddReview}>Submit a comment</button>
          </div>
          <ul className="reviews">
            {reviews.map((review, index) => (
              <li key={index} className="review-item">
                <div className="review-header">
                  <img src="https://th.bing.com/th/id/OIP.yp-D-KHI3e2nN4eMBJcEVAAAAA?rs=1&pid=ImgDetMain" alt="User avatar" className="avatar" />
                  <div>
                    <strong>{review.user}</strong>
                    <span className="review-date">{review.date}</span>
                  </div>
                </div>
                {/* <div className="review-content">{review.content}</div> */}
                <div dangerouslySetInnerHTML={{ __html: review.content }} className="review-content"></div>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="footer">
        <p>© 2024 Online Shopping Mall</p>
      </footer>
    </div>
  );
}

export default ProductPage;
