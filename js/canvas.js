const resolution = window.devicePixelRatio || 1;

function createGlowShape(size, colorRGB) {
	const oversample = 2;
	const padding = 30;
	const canvasSize = size + padding * 2;
	const renderSize = canvasSize * oversample;

	const c = document.createElement("canvas");
	const cctx = c.getContext("2d");
	c.width = renderSize * resolution;
	c.height = renderSize * resolution;
	cctx.scale(resolution, resolution);

	const center = renderSize / 2;
	const radius = (size * oversample) / 2;

	const gradient = cctx.createRadialGradient(
		center,
		center,
		0,
		center,
		center,
		radius,
	);
	gradient.addColorStop(0, `rgba(${colorRGB},0.9)`);
	gradient.addColorStop(0.3, `rgba(${colorRGB},0.5)`);
	gradient.addColorStop(0.7, `rgba(${colorRGB},0.15)`);
	gradient.addColorStop(1, `rgba(${colorRGB},0)`);

	cctx.shadowColor = `rgba(${colorRGB},0.6)`;
	cctx.shadowBlur = 15 * oversample;
	cctx.fillStyle = gradient;
	cctx.beginPath();
	cctx.arc(center, center, radius, 0, Math.PI * 2);
	cctx.fill();

	return { canvas: c, size: canvasSize };
}

const particleTypes = [
	{ rgb: "125,211,176", weight: 5 },
	{ rgb: "232,230,223", weight: 3 },
	{ rgb: "202,76,255", weight: 1 },
];
const weightedTypes = particleTypes.flatMap((t) => Array(t.weight).fill(t));
const sharedTextures = weightedTypes.map((t) => createGlowShape(24, t.rgb));

function randomNr(min, max) {
	if (max === undefined) {
		max = min;
		min = 0;
	}
	return min + (max - min) * Math.random();
}

// ===== 섹션 하나에 dust 캔버스를 붙이는 함수 =====
// canvasId: <canvas>의 id, sectionId: 그 캔버스를 담은 섹션의 id
function initDustCanvas(canvasId, sectionId, particleCount = 90) {
	const panel = document.getElementById(sectionId);
	const cv = document.getElementById(canvasId);
	if (!panel || !cv) return; // 해당 섹션이 없으면 조용히 건너뜀

	const ctx = cv.getContext("2d");
	let cvWidth, cvHeight;

	function resizeCv() {
		cvWidth = panel.offsetWidth;
		cvHeight = panel.offsetHeight;
		cv.width = cvWidth * resolution;
		cv.height = cvHeight * resolution;
		cv.style.width = cvWidth + "px";
		cv.style.height = cvHeight + "px";
		ctx.scale(resolution, resolution);
	}
	resizeCv();
	window.addEventListener("resize", resizeCv);

	const sprites = [];
	const timelines = []; // 여기 있는 타임라인들을 한꺼번에 재생/정지시킴

	function createSprite() {
		const baked =
			sharedTextures[Math.floor(Math.random() * sharedTextures.length)];
		const duration = randomNr(6, 14);

		const tl = gsap.timeline({
			delay: randomNr(3),
			repeat: -1,
			repeatDelay: randomNr(1),
		});

		const sprite = {
			baked,
			alpha: 0,
			scale: Math.random() < 0.85 ? randomNr(0.2, 0.6) : randomNr(0.8, 1.2),
			x: randomNr(0, cvWidth),
			y: randomNr(0, cvHeight),
		};

		tl.to(sprite, { duration: 1.5, alpha: 1 })
			.to(
				sprite,
				{
					duration,
					physics2D: {
						velocity: randomNr(15, 35),
						angle: randomNr(0, 360),
						gravity: 0,
					},
					ease: "sine.inOut",
				},
				"<",
			)
			.to(sprite, { duration: 1.5, alpha: 0 }, duration - 1.5);

		timelines.push(tl);
		return sprite;
	}

	for (let i = 0; i < particleCount; i++) {
		sprites.push(createSprite());
	}

	function render() {
		ctx.clearRect(0, 0, cvWidth, cvHeight);
		ctx.globalCompositeOperation = "lighter";
		sprites.forEach((s) => {
			if (!s.alpha) return;
			ctx.save();
			ctx.globalAlpha = s.alpha;
			ctx.translate(s.x, s.y);
			ctx.scale(s.scale, s.scale);
			ctx.drawImage(
				s.baked.canvas,
				-s.baked.size / 2,
				-s.baked.size / 2,
				s.baked.size,
				s.baked.size,
			);
			ctx.restore();
		});
		ctx.globalCompositeOperation = "source-over";
	}

	// 화면에 보일 때만 재생 - 안 보이면 타임라인도 멈추고, 렌더 함수도 ticker에서 뺌
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					timelines.forEach((tl) => tl.play());
					gsap.ticker.add(render);
				} else {
					timelines.forEach((tl) => tl.pause());
					gsap.ticker.remove(render);
				}
			});
		},
		{ threshold: 0.01 }, // 1%라도 보이면 켬
	);
	observer.observe(panel);
}

// GSAP 플러그인은 한 번만 등록
gsap.registerPlugin(Physics2DPlugin);

// ===== 각 섹션에 적용 =====
initDustCanvas("magic_dust_intro", "intro", 50);
initDustCanvas("magic_dust_skills", "skills", 40);
initDustCanvas("magic_dust_projects", "projects", 40);
