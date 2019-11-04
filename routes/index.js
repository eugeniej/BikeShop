var express = require('express');
var router = express.Router();

var myOwnKeys = {
  public: "pk_test_27DZz9wOSAWIegt2jVjcNUz500G61ojKRC",
  private: "sk_test_9YtvdW5rJb87L8BW48ibn5Hx00SQVmFiZn"
};

var stripe = require("stripe")(myOwnKeys.private);


var dataBike = [
  {name:"BIKO45" ,url:"/images/bike-1.jpg" ,price:679 },
  {name:"ZOOK7" ,url:"/images/bike-2.jpg" ,price:799 },
  {name:"LIKO89" ,url:"/images/bike-3.jpg" ,price:839 },
  {name:"GEWO8" ,url:"/images/bike-4.jpg" ,price:1249 },
  {name:"KIWIT" ,url:"/images/bike-5.jpg" ,price:899 },
  {name:"NASAY" ,url:"/images/bike-6.jpg" ,price:1399 }
]

/* GET home page. */
router.get('/', function(req, res, next) {

  if(req.session.dataCardBike == undefined) {
    req.session.dataCardBike = [];
  }
  res.render('index',{dataBike});
});

/* GET Shop page. */
router.get('/shop', function(req, res, next) {
  res.render('index',{dataBike});
});

/* POST Update page. */
router.post('/update-shop', function(req, res, next) {

  var position = req.body.position;
  var newQuantity = req.body.quantity;

  req.session.dataCardBike[position].quantity = newQuantity;

  res.render('shop',{dataCardBike:req.session.dataCardBike});
});

/* POST Delete-bike page. */
router.post('/delete-shop', function(req, res, next) {
 
  req.session.dataCardBike.splice(req.body.position,1)

  res.render('shop',{dataCardBike:req.session.dataCardBike});
});


/* POSTShop page. */
router.post('/shop', function(req, res, next) {

  req.session.dataCardBike.push({
    name:req.body.bikeNameFromFront,
    url: req.body.bikeImageFromFront,
    price:req.body.bikePriceFromFront,
    quantity:req.body.bikeQuantityFromFront
    })

  res.render('shop', {dataCardBike:req.session.dataCardBike});
});



/* POST checkout page. */
router.post('/charge', function(req, res, next) {

  console.log("from checkout", req.session.dataCardBike)

  console.log("from checkout", req.body);


 const token = req.body.stripeToken;


  var totalCmdFromBackEnd = 0;
  var ordersReferences = [];

  for (var i = 0; i < req.session.dataCardBike.length; i++) {
    totalCmdFromBackEnd = totalCmdFromBackEnd + (req.session.dataCardBike[i].quantity * req.session.dataCardBike[i].price);
    ordersReferences.push(req.session.dataCardBike[i].name)
  };

  var name = req.body.stripeShippingName + " | ";
  var fullAddress = req.body.stripeShippingAddressLine1 + " - " + req.body.stripeShippingAddressZip + " - " + req.body.stripeShippingAddressCity + " | ";
  var ordersList = "Ref: "+ ordersReferences.join(' - ');


  (async () => {
    const charge = await stripe.charges.create({
      amount: totalCmdFromBackEnd*100,
      currency: 'eur',
      description: name + fullAddress + ordersList,
      source: token
    }).then(req.session.dataCardBike = []);
  })();

  res.render('confirm');
});




module.exports = router;
