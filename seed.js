const mongoose = require('mongoose');
const Car = require('./models/Car');

const dbURL = 'mongodb+srv://VoDaiVy:Daivyluonnoluc1324@chapter6sdn302.ixjjuz5.mongodb.net/autorent_pro?retryWrites=true&w=majority';

mongoose.connect(dbURL)
    .then(() => console.log('Connected to DB!'))
    .catch(err => console.log(err));

const sampleCars = [
    {
        brand: "VinFast",
        model: "VF 8 Plus",
        licensePlate: "30K-123.45",
        pricePerDay: 1500000,
        pricePerHour: 150000,
        status: "AVAILABLE",
        image: "https://images.unsplash.com/photo-1698218181636-6e46955d5d88?q=80&w=800&auto=format&fit=crop",
        seats: 5,
        transmission: "Tự động",
        fuelType: "Điện",
        description: "Mẫu SUV điện thông minh của VinFast với thiết kế sang trọng, công nghệ ADAS tiên tiến và khả năng vận hành êm ái."
    },
    {
        brand: "Mercedes-Benz",
        model: "C300 AMG",
        licensePlate: "51H-999.99",
        pricePerDay: 2500000,
        pricePerHour: 250000,
        status: "AVAILABLE",
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
        seats: 5,
        transmission: "Tự động 9 cấp",
        fuelType: "Xăng",
        description: "Biểu tượng của sự sang trọng và thể thao. Nội thất cao cấp, động cơ mạnh mẽ mang lại cảm giác lái phấn khích."
    },
    {
        brand: "Ford",
        model: "Ranger Wildtrak",
        licensePlate: "15C-333.33",
        pricePerDay: 1000000,
        pricePerHour: 100000,
        status: "AVAILABLE",
        image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=800&q=80",
        seats: 5,
        transmission: "Tự động 10 cấp",
        fuelType: "Dầu Diesel",
        description: "Ông vua bán tải với khả năng off-road đỉnh cao, thùng xe rộng rãi, phù hợp cho những chuyến đi xa."
    },
    {
        brand: "Hyundai",
        model: "SantaFe Premium",
        licensePlate: "43A-888.88",
        pricePerDay: 1400000,
        pricePerHour: 140000,
        status: "MAINTENANCE",
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
        seats: 7,
        transmission: "Tự động",
        fuelType: "Dầu",
        description: "Mẫu xe gia đình 7 chỗ rộng rãi, tiết kiệm nhiên liệu và đầy đủ tiện nghi an toàn."
    }
];

const seedDB = async () => {
    await Car.deleteMany({});
    await Car.insertMany(sampleCars);
    console.log('Seeding completed!');
    mongoose.connection.close();
};

seedDB();