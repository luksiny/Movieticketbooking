

// Loop through all book buttons dynamically
for (let i = 1; i <= 30; i++) {
  const button = document.getElementById(`booktickets${i}`);
  if (button) {
    button.addEventListener("click", function () {
      const ticketPrice = parseInt(button.dataset.price);
      const movieCard = document.getElementById(`movie${i}`);
      const title = movieCard.querySelector("h3").textContent;
      const quantity = parseInt(document.getElementById(`quantity${i}`).value);

      if (!quantity || quantity <= 0) {
        alert("Please enter a valid quantity.");
        return;
      }
      alert("tickets were added")

      const total = quantity * ticketPrice;

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${title}</td>
        <td>${quantity}</td>
        <td>Rs.${ticketPrice}</td>
        <td>Rs.${total}</td>
      `;
      document.getElementById("orderItems").appendChild(newRow);

      updateTotalPrice();
    });
  }
}


// Function to update the total price at bottom
function updateTotalPrice() {
  const rows = document.querySelectorAll("#orderItems tr");
  let grandTotal = 0;

  rows.forEach(row => {
    const priceText = row.children[3].textContent.replace("Rs.", "");
    grandTotal += parseFloat(priceText);
  });

  document.getElementById("totalPrice").textContent = `Total Price: Rs.${grandTotal}`;
}

// Save Booking to LocalStorage and Buy Now //
const buyNowBtn = document.getElementById("buyNow");
if (buyNowBtn) {
  buyNowBtn.addEventListener("click", () => {
    const rows = document.querySelectorAll("#orderItems tr");
    const items = [];

    rows.forEach(row => {
      const cols = row.children;
      items.push({
        name: cols[0].textContent,
        quantity: parseInt(cols[1].textContent),
        price: parseInt(cols[2].textContent.replace("Rs.", "")),
        total: parseInt(cols[3].textContent.replace("Rs.", ""))
      });
    });

    const bookingDetails = { items: items };
    localStorage.setItem("bookingDetails", JSON.stringify(bookingDetails));
    window.location.href = "checkout.html";
  });
}



//  Save as Favourite //
function saveToFavourites() {
  const rows = document.querySelectorAll("#orderItems tr");
  const items = [];

  rows.forEach(row => {
    const cols = row.children;
    items.push({
      name: cols[0].textContent,
      quantity: parseInt(cols[1].textContent),
      price: parseInt(cols[2].textContent.replace("Rs.", "")),
      total: parseInt(cols[3].textContent.replace("Rs.", ""))
    });
  });

  const favouriteBooking = { items: items };
  localStorage.setItem("favouriteBooking", JSON.stringify(favouriteBooking));
  alert("Booking saved as favourite!");
}

// Apply Favourite Booking 
const applyFavBtn = document.getElementById("applyFavorite");
if (applyFavBtn) {
  applyFavBtn.addEventListener("click", () => {
    const favourite = JSON.parse(localStorage.getItem("favouriteBooking"));
    const tableBody = document.getElementById("orderItems");
    tableBody.innerHTML = "";

    if (favourite && favourite.items.length > 0) {
      favourite.items.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>Rs.${item.price}</td>
          <td>Rs.${item.total}</td>
        `;
        tableBody.appendChild(row);
      });
      updateTotalPrice();
    } else {
      alert("No favourite booking found.");
    }
  });
}





// CHECKOUT PAGE  //

document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.getElementById("checkoutItems");
  const totalDisplay = document.getElementById("checkoutTotal");
  const payBtn = document.getElementById("payBtn");
  const confirmationBox = document.getElementById("confirmation");
  const seatCounter = document.getElementById("seatCounter");
  const seatInput = document.getElementById("seats");

  const selectedSeats = [];
  let totalSeatsAllowed = 0;

  const bookingData = JSON.parse(localStorage.getItem("bookingDetails"));
  if (bookingData && bookingData.items.length > 0) {
    let total = 0;
    bookingData.items.forEach(item => {
      total += item.total;
      totalSeatsAllowed += item.quantity;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>Rs.${item.price}</td>
        <td>Rs.${item.total}</td>
      `;
      tableBody.appendChild(row);
    });
    totalDisplay.textContent = `Total: Rs.${total}`;
  } else {
    tableBody.innerHTML = `<tr><td colspan="4">No bookings found.</td></tr>`;
  }

  // Initialize seat counter
  if (seatCounter) {
    seatCounter.textContent = `Seats Selected: 0 / ${totalSeatsAllowed}`;
  }

  // Seat selection logic
  document.querySelectorAll(".seat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const seatId = btn.id;

      if (btn.classList.contains("selected")) {
        btn.classList.remove("selected");
        const index = selectedSeats.indexOf(seatId);
        if (index > -1) selectedSeats.splice(index, 1);
      } else {
        if (selectedSeats.length >= totalSeatsAllowed) {
          alert(`You can only select ${totalSeatsAllowed} seat(s).`);
          return;
        }
        btn.classList.add("selected");
        selectedSeats.push(seatId);
      }

      // Update seat counter and hidden input
      if (seatCounter) {
        seatCounter.textContent = `Seats Selected: ${selectedSeats.length} / ${totalSeatsAllowed}`;
      }
      seatInput.value = selectedSeats.join(", ");
    });
  });

  // PAY button logic
  payBtn.addEventListener("click", () => {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const card = document.getElementById("card").value.trim();
    const seats = seatInput.value.trim();
    const time = document.getElementById("movieTime").value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !email || !card || !seats || !time) {
      alert("Please fill all the fields!");
      return;
    }
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address!");
      return;
    }

    const ref = "TKT-" + Math.floor(100000 + Math.random() * 900000);
    let movieDetailsHTML = "";
    const movieRows = document.querySelectorAll("#checkoutItems tr");
    movieRows.forEach(row => {
      const cols = row.querySelectorAll("td");
      if (cols.length === 4) {
        movieDetailsHTML += `<p><strong>${cols[0].textContent}</strong> - Qty: ${cols[1].textContent}, Price: ${cols[2].textContent}, Total: ${cols[3].textContent}</p>`;
      }
    });

    confirmationBox.innerHTML = `
      <h2>🎉 Thank you, ${name}!</h2>
      <p>Your payment was successful.</p>
      <p><strong>Show Time:</strong> ${time}</p>
      <p><strong>Seats:</strong> ${seats}</p>
      <p><strong>Booking Ref:</strong> ${ref}</p>
      <div style="margin-top: 10px;">${movieDetailsHTML}</div>
    `;
    confirmationBox.style.display = "block";

    // Clear localStorage
    localStorage.removeItem("bookingDetails");
  });
});


