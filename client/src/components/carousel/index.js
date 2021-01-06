import React, { useCallback, useEffect, useState } from 'react';
import { PrevButton, NextButton } from "./Buttons";
import Cyberpunk from '../../assets/img/slider_img/Cyberpunk.png';
import FFVII from '../../assets/img/slider_img/FFVII.jpg';
import Fifa2021 from '../../assets/img/slider_img/Fifa2021.jpg';
import { useEmblaCarousel } from 'embla-carousel/react'
import { StyledCarousel } from '../styles/styled_carousel';
import Fade from 'react-reveal/Fade'
import { Btn } from '../styles/styled_global';
const Carousel = () => {
	const [viewportRef, embla] = useEmblaCarousel({ loop: true, speed: 5 });
	const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
	const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

	const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla]);
	const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla]);
	const onSelect = useCallback(() => {
		if (!embla) return;
		setPrevBtnEnabled(embla.canScrollPrev());
		setNextBtnEnabled(embla.canScrollNext());
	}, [embla]);

	useEffect(() => {
		if (!embla) return;
		embla.on("select", onSelect);
		onSelect();
	}, [embla, onSelect]);

	return (
		<StyledCarousel>
			<Fade big>
				<div className="embla">
					<div className="embla__viewport" ref={viewportRef}>
						<div className="embla__container">
							<div className="embla__slide">
								<div className="embla__slide__inner">
									<img className="embla__slide__img" src={FFVII} alt="A cool cat." />
									<div className="embla__slide__detail">
										<h3>Final Fantasy VII</h3>
										<div>
											<span>-20%</span>
											<span>10.99</span>
											<Btn className="btn btn-ppal">Add to cart</Btn>
										</div>
									</div>
								</div>
							</div>
							<div className="embla__slide">
								<div className="embla__slide__inner">
									<img className="embla__slide__img" src={Cyberpunk} alt="A cool cat." />
									<div className="embla__slide__detail">
										<h3>CyberPunk</h3>
										<div>
											<span>-15%</span>
											<span>9.99</span>
											<Btn className="btn btn-ppal">Add to cart</Btn>
										</div>
									</div>
								</div>
							</div>
							<div className="embla__slide">
								<div className="embla__slide__inner">
									<img className="embla__slide__img" src={Fifa2021} alt="A cool cat." />
									<div className="embla__slide__detail">
										<h3>FIFA 2021</h3>
										<div>
											<span>30%</span>
											<span>19.99</span>
											<Btn className="btn btn-ppal">Add to cart</Btn>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<PrevButton onClick={scrollPrev} enabled={prevBtnEnabled} />
					<NextButton onClick={scrollNext} enabled={nextBtnEnabled} />
				</div>
			</Fade>
		</StyledCarousel>
	);
};

export default Carousel;