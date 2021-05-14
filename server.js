
let express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const nodemailer=require('nodemailer');
let abou =0;

dotenv.config();
let app = express();
const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});
//Middlewares
app.use(cors());
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(express.static("public"));
app.use(bodyParser.json());
app.set("view engine", "ejs");

//Routes


app.get("/" , (req ,res) =>{
  res.render("index");
});

app.get("/payments", (req, res) => {
  res.render("payment", { key: process.env.KEY_ID });
});


app.post("/payments" , function(req , res) {
  global.name = req.body.name;
  global.email = req.body.email;
  global.contact = req.body.contact;
  global.amount = req.body.amount;
   key =  process.env.KEY_ID;


})
app.post("/api/payment/order", (req, res) => {
  params = req.body;
  instance.orders
    .create(params)
    .then((data) => {
      res.send({ sub: data, status: "success" });
    })
    .catch((error) => {
      res.send({ sub: error, status: "failed" });
    });
});

app.post("/api/payment/verify", (req, res) => {

  
  body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;

  var expectedSignature = crypto
    .createHmac("sha256", process.env.KEY_SECRET)
    .update(body.toString())
    .digest("hex");
  // console.log("sig" + req.body.razorpay_signature);
  // console.log("sig" + expectedSignature);
  var response = { status: "failure" };
  if (expectedSignature === req.body.razorpay_signature && abou ==0)
  {
    // response = { status: "success" };
    abou = 1;
    const transpoter=nodemailer.createTransport( {
          service:'gmail',



          auth:{
              user:'mithunfoundationdonation@gmail.com',
              pass:process.env.YOUR_PASSWORD
          }
      });
      const mailOptions={
          from: 'mithunfoundationdonation@gmail.com',
          to:global.email,
          subject:`Donation to Mithun Foundation`,
          text:`We are GrateFul that you have Given us the Donation of ${global.amount}`,
          html:`<h1>From The Mithun Foundation</h1>
          <p>We the People in the Foundation are very Humbled By Your Donation of  Rs ${global.amount}</p>
          <p>You can Verify the Details of Transaction Given as Follows</p>
          <p>Payment id : ${req.body.razorpay_payment_id}</p>
          <p>Order id : ${req.body.razorpay_order_id}</p>
          <p>Pls Don't Reply to This Mail</p> `
      }



      transpoter.sendMail(mailOptions,(error,info)=>{
          if(error) {
              console.log(error);

          }

      });
  }


});


app.listen(process.env.PORT || 3000, () => {
  console.log("server started");
});
