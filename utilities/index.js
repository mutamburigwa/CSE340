const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Util = {};

// Middleware to check if a user is logged in
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

// Middleware to check JWT token
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
      if (err) {
        req.flash("notice", "Please log in");
        res.clearCookie("jwt");
        return res.redirect("/account/login");
      }
      res.locals.accountData = {
        firstName: accountData.firstName,  // Ensure these fields match the JWT payload
        email: accountData.email,
        type: accountData.type
      };
      res.locals.loggedin = 1;
      next();
    });
  } else {
    next();
  }
};

// Function to build navigation list
Util.getNav = async () => {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list += `<a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a>`;
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

// Function to build classification grid
Util.buildClassificationGrid = async (data) => {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += '<li>';
      grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details"><img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" /></a>`;
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += `<h2><a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a></h2>`;
      grid += `<span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>`;
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

// Function to build vehicle detail
Util.buildVehicleDetail = (vehicle) => {
  return `
    <div class="vehicle-detail">
      <div class="vehicle-detail-image">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      </div>
      <div class="vehicle-detail-content">
        <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Year:</strong> ${vehicle.inv_year}</p>
        <p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>
        <p><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      </div>
    </div>`;
};

// Function to handle errors in asynchronous functions
Util.handleErrors = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Function to build a list of classifications for a form
Util.buildClassificationList = async (classification_id = null) => {
  let data = await invModel.getClassifications();
  let classificationList = '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}" ${classification_id == row.classification_id ? "selected" : ""}>${row.classification_name}</option>`;
  });
  classificationList += "</select>";
  return classificationList;
};

module.exports = Util;
