const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invController = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invController.buildByClassificationId = async function (req, res, next) {
  const classificationId = req.params.classificationId;
  try {
    const data = await invModel.getInventoryByClassificationId(classificationId);
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    });
  } catch (error) {
    console.error("Error building classification view: ", error);
    next(error);
  }
};

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invController.buildByVehicleId = async function (req, res, next) {
  const vehicleId = req.params.vehicleId;
  try {
    const vehicle = await invModel.getVehicleById(vehicleId);
    const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`;
    const nav = await utilities.getNav();
    res.render("./inventory/detail", {
      title,
      nav,
      vehicle,
    });
  } catch (error) {
    console.error("Error building vehicle detail view: ", error);
    next(error);
  }
};

module.exports = invController;
