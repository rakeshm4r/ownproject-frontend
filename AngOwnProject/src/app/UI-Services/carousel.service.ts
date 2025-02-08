// carousel.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarouselService {
  images = [
    'assets/Carousel_Images/img1.webp',
    'assets/Carousel_Images/img2.webp',
    'assets/Carousel_Images/img3.webp',
    'assets/Carousel_Images/img4.webp',
    'assets/Carousel_Images/img5.webp',
    'assets/Carousel_Images/img6.webp'
  ];
  
  // Use a BehaviorSubject to track the current index, it will auto-update components
  private currentIndexSubject = new BehaviorSubject<number>(0);
  currentIndex$ = this.currentIndexSubject.asObservable();

  // Get the current image URL
  getCurrentImage(): string {
    return this.images[this.currentIndexSubject.value];
  }

  // Change to the next image (circular behavior)
  nextImage() {
    let newIndex = (this.currentIndexSubject.value + 1) % this.images.length;
    this.currentIndexSubject.next(newIndex);
  }

  // Change to the previous image (circular behavior)
  prevImage() {
    let newIndex = (this.currentIndexSubject.value - 1 + this.images.length) % this.images.length;
    this.currentIndexSubject.next(newIndex);
  }

  // Start the auto-slide function
  startAutoSlide(interval: number) {
    setInterval(() => {
      this.nextImage();
    }, interval);
  }
}
