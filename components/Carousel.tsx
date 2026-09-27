"use client"

import { useState, ReactNode } from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from "react";

interface CarouselProps {
  children: React.ReactNode;
  itemsPerView?: number;
  height: number;
}

export default function Carousel({ children, itemsPerView = 1, height = 400 }: CarouselProps) {
    const items = React.Children.toArray(children);
    const [currentIndex, setCurrentIndex] = useState(0);
    const maxIndex = Math.max(0, items.length - itemsPerView);

    const nextSlide = () => {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
    }

    const prevSlide = () => {
        setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1))
    }

    const goToSlide = (index: number) => {
        setCurrentIndex(Math.min(index, maxIndex))
    }

    return (
      <div className="w-full sm:px-21 lg:px-42 xl:px-84 overflow-hidden">
        <div className="relative flex items-center justify-center" style={ {height: height} }>
          {(
            <>
              <button
                onClick={prevSlide}
                aria-label="Previous"
                className="absolute left-0 z-40 flex h-11 w-11 items-center justify-center rounded-md border border-ink bg-paper transition-colors hover:bg-ink hover:text-paper"
              >
                <ChevronLeft size={20} strokeWidth={1.75} />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Next"
                className="absolute right-0 z-40 flex h-11 w-11 items-center justify-center rounded-md border border-ink bg-paper transition-colors hover:bg-ink hover:text-paper"
              >
                <ChevronRight size={20} strokeWidth={1.75} />
              </button>
            </>
          )}

          <div className="relative w-full h-full flex items-center justify-center">
            {items.map((item, index) => {
              const offset = index - currentIndex
              const isCenter = offset === 0
              const isLeft = offset === -1 || (offset === items.length - 1 && currentIndex === 0)
              const isRight = offset === 1 || (offset === -(items.length - 1) && currentIndex === items.length - 1)
              const isVisible = isCenter || isLeft || isRight

              let transformStyle = ''
              let zIndex = 0
              let opacity = 0
              let scale = 0.7

              if (isCenter) {
                transformStyle = 'translateX(0)'
                zIndex = 30
                opacity = 1
                scale = 1
              } else if (isLeft) {
                transformStyle = 'translateX(-100%)'
                zIndex = 10
                opacity = 0.5
                scale = 0.8
              } else if (isRight) {
                transformStyle = 'translateX(100%)'
                zIndex = 10
                opacity = 0.5
                scale = 0.8
              }

              return (
                <div
                  key={index}
                  className="absolute transition-all duration-500 ease-out mb-8"
                  style={{
                    transform: `${transformStyle} scale(${scale})`,
                    zIndex,
                    opacity: isVisible ? opacity : 0,
                    
                    pointerEvents: isVisible ? 'auto' : 'none'
                  }}
                >
                  {item}
                </div>
              )
            })}
          </div>

          {(
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-2">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-0.5 transition-all ${
                    index === currentIndex ? 'w-10 bg-ink' : 'w-6 bg-line-strong'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
}
  
