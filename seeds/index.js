const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campgrounds");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,

  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "668be3a99049584011babc7c",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dwe1byozy/image/upload/v1729347409/YelpCamp/wxllmcbiuyshzluv2nrr.jpg",
          filename: "YelpCamp/wxllmcbiuyshzluv2nrr",
        },
        {
          url: "https://res.cloudinary.com/dwe1byozy/image/upload/v1729347419/YelpCamp/amo0dmrlrtg8gtwbjaax.jpg",
          filename: "YelpCamp/amo0dmrlrtg8gtwbjaax",
        },
      ],
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
