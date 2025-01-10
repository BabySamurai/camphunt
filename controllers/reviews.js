const axios = require('axios');
const Review = require("../models/review");
const Campground = require("../models/campground");

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const reviewText = req.body.review.body;
  
  try {
    // Ensure the data is properly formatted as JSON
    const response = await axios.post('http://127.0.0.1:5000/predict', {
      message: reviewText
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.prediction === 'spam') {
      req.flash("error", "Your review was detected as spam and could not be posted.");
      return res.redirect(`/campgrounds/${campground._id}`);
    }

    // Save the review if it's not spam
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();

    req.flash("success", "created new review");
    res.redirect(`/campgrounds/${campground._id}`);
  } catch (err) {
    console.error('Error during spam check:', err);
    req.flash("error", "Something went wrong while checking for spam.");
    res.redirect(`/campgrounds/${campground._id}`);
  }
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "successfully deleted a review");
  res.redirect(`/campgrounds/${id}`);
};
