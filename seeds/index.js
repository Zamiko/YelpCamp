const mongoose = require('mongoose');
const Campground = require("../models/campground");
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];
const price = Math.floor(Math.random() * 20) + 10;
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            author: '611e9ff1e41293237c0a8a4b', //YOUR USER ID
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aut nesciunt quo mollitia omnis alias iusto repellendus, fugit minus, dolor quas, voluptatum tempore explicabo! Dicta nostrum explicabo cumque id facere accusantium!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dtumceidz/image/upload/v1629429590/YelpCamp/kszsnfhkojjzgtmpcx6f.jpg',
                    filename: 'YelpCamp/kszsnfhkojjzgtmpcx6f'
                },
                {
                    url: 'https://res.cloudinary.com/dtumceidz/image/upload/v1629429590/YelpCamp/fwtkd689jx7pwm56ab8c.jpg',
                    filename: 'YelpCamp/fwtkd689jx7pwm56ab8c'
                }
            ],
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})