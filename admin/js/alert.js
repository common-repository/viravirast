function Noti({
	content,
	status,
	animation = true,
	timer = 4000,
	progress = true,
	bgcolor,
	icon = 'checkmark-circle'
}) {
	var status = status;
	var viravirastNotiContainer = document.createElement('div');
	var Noti_alert = document.createElement('div');
	var timer_progress = document.createElement('div');
	viravirastNotiContainer.setAttribute('id', 'viravirast-noti-container');
	document.body.appendChild(viravirastNotiContainer);
	document.getElementById('viravirast-noti-container').appendChild(Noti_alert);
	timer_progress.setAttribute('class', 'timer_progress');
	if (progress != false) {
		document.querySelector('#viravirast-noti-container').appendChild(timer_progress);
	}
	if (animation == true) {
		Noti_alert.style = `
      -webkit-animation: 1s Noti_animation;
  animation: 1s Noti_animation;
  background: ${bgcolor}
  `;
	} else {
		Noti_alert.style = `
  background: ${bgcolor}
  `;
	}
	Noti_alert.addEventListener('click', function () {
		this.remove();
		timer_progress.remove();
	});
	const noti_destroy = function () {
		document.getElementById('viravirast-noti-container').removeChild(Noti_alert);
		timer_progress.remove();
	}
	var timeout = setTimeout(() => {
		noti_destroy();
	}, timer);
	Noti_alert.onmouseover = function () {
		clearTimeout(timeout);
		timer_progress.style.animationPlayState = 'paused';
		this.onmouseleave = function () {
			setTimeout(noti_destroy, timer);
			timer_progress.style.animationPlayState = 'running';
		}
	};
	Noti_alert.setAttribute('class', 'noti-child');
	Noti_alert.innerHTML = "<ion-icon name='"+icon+"'></ion-icon>" + "<span>" + content + "</span>";
	timer_progress.style.animation = `${timer/1000}s timer_progress_animation`;
	timer_progress.style.webkitAnimation = `${timer/1000}s timer_progress_animation`;
}