window.onload = function() {

//document.onreadystatechange = function() {
	//console.log(document.readyState);
	//if (document.readyState === 'complete') {

	/*
	## BASE
	*/

	/* ## sidenav ## */
	const sidenav_dom = document.querySelector('nav');
	if(sidenav_dom) { // Check if module exist on page
		const sidenav = new SIDENAV(sidenav_dom);
	}

	/*
	## MODULAR PARTS
	*/

	/* ## COPY TO CLIPBOARD ## */
	const ctc_dom = document.querySelectorAll('.copy-to-clipboard');
	if(ctc_dom) { // Check if module exist on page
		const ctc = []
		ctc_dom.forEach((element, index) => {
			ctc[index] = new COPY_TO_CLIPBOARD(element);
		});
	}

	/*
	## MODULARS
	*/

	/* ## TEAM GENERATOR ## */
	const teamgen_dom = document.querySelector('[modular=team-generator]');
	if(teamgen_dom) { // Check if module exist on page
		const teamgenerator = new TEAMGEN(teamgen_dom);
	}
}