const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".header_nav a");

function setActiveNav() {
	const scrollPos = window.scrollY + 80;

	// 1. 페이지가 최하단에 도달했는지 확인하는 조건 추가
	const isAtBottom =
		window.innerHeight + window.scrollY >=
		document.documentElement.scrollHeight - 1;

	let currentId = sections[0].id;

	if (isAtBottom) {
		// 2. 최하단에 도달했다면 무조건 마지막 섹션의 ID를 가져옴
		currentId = sections[sections.length - 1].id;
	} else {
		// 기존 스크롤 위치 계산 로직
		sections.forEach((section) => {
			if (scrollPos >= section.offsetTop) {
				currentId = section.id;
			}
		});
	}

	navLinks.forEach((link) => {
		link.classList.toggle(
			"is_active",
			link.getAttribute("href") === `#${currentId}`,
		);
	});
}

window.addEventListener("scroll", setActiveNav);
setActiveNav();
