"use client"

import { useState, ReactNode } from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from "react";

// <T> makes it work with any type
interface CarouselProps<T> {
  items: T[]                                
  renderItem: (item: T, index: number) => ReactNode
  itemsPerView?: number
  height: number 
}

export default function Carousel<T>( { items, renderItem, itemsPerView = 1, height = 400 }: CarouselProps<T> ) {
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
                className="absolute left-0 z-40 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 z-40 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <ChevronRight size={24} />
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
                    filter: isCenter ? 'blur(0)' : 'blur(2px)',
                    pointerEvents: isVisible ? 'auto' : 'none'
                  }}
                >
                  {renderItem(item, index)}
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
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex ? 'bg-[#578FCA] 0 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
}
  
