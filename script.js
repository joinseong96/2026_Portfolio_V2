const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".header_nav a");

function setActiveNav() {
	const scrollPos = window.scrollY + 80;
	let currentId = sections[0].id;

	sections.forEach((section) => {
		if (scrollPos >= section.offsetTop) {
			currentId = section.id;
		}
	});

	navLinks.forEach((link) => {
		link.classList.toggle(
			"is_active",
			link.getAttribute("href") === `#${currentId}`,
		);
	});
}

window.addEventListener("scroll", setActiveNav);
setActiveNav();

// ===== 스크롤 리빌 애니메이션 =====
const revealTargets = document.querySelectorAll(".reveal, .reveal_stagger");

const revealObserver = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("is_visible");
				revealObserver.unobserve(entry.target);
			}
		});
	},
	{ threshold: 0.15 },
);

revealTargets.forEach((target) => revealObserver.observe(target));
