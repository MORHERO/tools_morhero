class CDM {
	createSimpleElement(tag_name='div', class_name='', attributes='',text='', text_wrapper=''){
		let element = document.createElement(tag_name);
		if(class_name) {
			if(typeof class_name == 'string') {
				element.classList.add(class_name);
			}else {
				for (let i = 0; i < class_name.length; i++) {
					element.classList.add(class_name[i]);
				}
			}
		}
		if(attributes) {
			if(typeof attributes == 'object') {
				for (let i = 0; i < attributes.length; i++) {
					element.setAttribute(attributes[i][0], attributes[i][1]);
				}
			}
		}
		if(text) {
			if(typeof text == 'string') {
				let node = document.createTextNode(text);
				if(text_wrapper) {
					let text_wrap = document.createElement(text_wrapper);
					text_wrap.appendChild(node);
					element.appendChild(text_wrap);
				}else {
					element.appendChild(node);
				}
			}
		}

		return element;
	}
}
const cdm = new CDM();