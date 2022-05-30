extern crate rustc_serialize;
extern crate rustface;

use image::{DynamicImage, GrayImage};
use regex::Regex;
use rustc_serialize::json::Json;
use rustface::{Detector, FaceInfo, ImageData};
use std::fs;
use std::io::Read;
use std::time::{Duration, Instant};
use std::cmp;

const MODEL_PATH: &str = "./src/seeta_fd_frontal_v1.0.bin";
const TWEETS_PATH: &str = "./data/tweets-ranked.json";
const INPUT_DIR: &str = "./images";
const OUTPUT_DIR: &str = "./faces";

fn get_millis(duration: Duration) -> u64 {
    duration.as_secs() * 1000u64 + u64::from(duration.subsec_nanos() / 1_000_000)
}

fn detect_faces(detector: &mut dyn Detector, image: &GrayImage) -> Vec<FaceInfo> {
    let (width, height) = image.dimensions();
    let mut image = ImageData::new(image, width.try_into().unwrap(), height.try_into().unwrap());
    let now = Instant::now();
    let faces = detector.detect(&mut image);
    println!(
        "Found {} faces in {} ms",
        faces.len(),
        get_millis(now.elapsed())
    );
    faces
}

fn main() {
    let mut detector = rustface::create_detector(MODEL_PATH).unwrap();
    detector.set_min_face_size(20);
    detector.set_score_thresh(2.0);
    detector.set_pyramid_scale_factor(0.8);
    detector.set_slide_window_step(4, 4);

    let mut tweets = fs::File::open(TWEETS_PATH).unwrap();
    let mut tweet_data = String::new();
    tweets.read_to_string(&mut tweet_data).unwrap();
    let json = Json::from_str(&tweet_data).unwrap();
    let num_tweets = json.as_array().unwrap().len();
    let mut index = 0;

    let file_type_regexp = Regex::new(".*\\.(png|jpg|gif|bmp)").unwrap();

    if !fs::metadata(OUTPUT_DIR).is_ok() {
        match fs::create_dir(OUTPUT_DIR) {
            Ok(()) => println!("Created {} directory", OUTPUT_DIR),
            Err(message) => {
                println!("Failed to create {} directory: {}", OUTPUT_DIR, message);
                std::process::exit(1)
            }
        };
    }

    loop {
        if index == num_tweets {
            break;
        }

        let media_key: String = match json[index]
            .find_path(&["media", "media_key"])
            .unwrap()
            .as_string()
        {
            Some(media_key) => media_key.replace("\"", ""),
            _ => {
                println!("Failed to parse media_key");
                std::process::exit(1)
            }
        };

        let url: String = match json[index]
            .find_path(&["media", "url"])
            .unwrap()
            .as_string()
        {
            Some(url) => url.to_string(),
            _ => {
                println!("Failed to parse url");
                std::process::exit(1)
            }
        };

        let file_type: String = match file_type_regexp.captures(&url) {
            Some(captures) => captures.get(1).unwrap().as_str().to_string(),
            None => {
                println!("Failed to match file_type");
                std::process::exit(1)
            }
        };

        println!("Analyzing {}.{}", media_key, file_type);

        let input_image_path = format!("{}/{}.{}", INPUT_DIR, media_key, file_type);

        let mut image: DynamicImage = match image::open(input_image_path) {
            Ok(image) => image,
            Err(message) => {
                println!("Failed to read image {}: {}", media_key, message);
                std::process::exit(1)
            }
        };

        let faces = detect_faces(&mut *detector, &image.to_luma8());

        for (index, face) in faces.iter().enumerate() {
            let bbox = face.bbox();

            match cmp::min(bbox.x(), bbox.y()).is_negative() {
                true => {
                    println!("Out of bounds for face: {}. x: {}, y: {}", index, bbox.x(), bbox.y());
                }
                _ => {
                    let cropped = image.crop(
                        bbox.x().try_into().unwrap(),
                        bbox.y().try_into().unwrap(),
                        bbox.width(),
                        bbox.height(),
                    );
                    let suffix: String = match faces.len() {
                        1 => "".to_string(),
                        _ => format!("_{}", index),
                    };
        
                    match cropped.save(format!("{}/{}{}.png", OUTPUT_DIR, media_key, suffix)) {
                        Ok(_) => println!("Saved result to {}{}.png", media_key, suffix),
                        Err(message) => println!("Failed to save result to a file. Reason: {}", message),
                    }
                }
            }
        }

        println!("{} of {} complete", index, num_tweets);

        index += 1;
    }
}
