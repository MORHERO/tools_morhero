/*
## BASE
*/
class SIDENAV {
	constructor(parent) {
		const that = this;

		this._parent = parent;
		this._toggle_btn = parent.querySelector('.bottom .toggle');
		this._nav_status = (sessionStorage.getItem("nav_status")!=null)?(this._nav_status=sessionStorage.getItem("nav_status")):(1); // 1=open / 0=close

		if(this._nav_status == 0){
			this._toggle_nav();
		}

		// Event Listener
		this._toggle_btn.addEventListener('click', function(e) {
			that._toggle_nav();
		});

	}

	_toggle_nav() {
		if(this._nav_status) {
			this._nav_status = 0;
			this._parent.classList.add('closed');
		}else {
			this._nav_status = 1;
			this._parent.classList.remove('closed');
		}
		
		sessionStorage.setItem("nav_status", this._nav_status);
		return;
	}
}

/*
## MODULAR PARTS
*/
class COPY_TO_CLIPBOARD {
	constructor (parent) {
		const that = this
		this._parent = parent;
		this._copy_btn = parent.querySelector('button');
		this._target_span = parent.querySelector('span');

		// Setup Event Listeners
		this._copy_event = this._copy_btn.addEventListener('click', () => this._copy());
	}
	_copy() {
		// Copy the text inside the text field
		navigator.clipboard.writeText(this._target_span.innerHTML);
		return;
	}
}

/*
## MODULARS
*/
class TEAMGEN {
	constructor(parent) {
		const that = this;

		this._parent = parent;

		this._add_player_btn = parent.querySelector('[task=add_player]');
		this._input_playername = parent.querySelector('[name=player_name_master]');
		this._input_playerrating = parent.querySelector('[name=player_rating_master]');

		this._playerlist_dom = parent.querySelector('table.inputlist');
		this._playerlist = [];

		this._player_count = 0;
		this._player_count_dom = parent.querySelector('[target=player_count]');
		this._player_id = 0;
		
		this._settings_team_amount_dom = parent.querySelector('input[name=team_amount]');
		this._settings_rating_enabled_dom = parent.querySelector('input[name=rating_enabled]');
		this._settings_rating_inverted_dom = parent.querySelector('input[name=rating_inverted]');

		this._result_teams_main_dom = parent.querySelector('.result .teams');
		this._result_teams_alt_dom = parent.querySelector('.result .alt-list');

		this._teamlist = [];

		this.tns = tns({
			"container": "[modular=team-generator] .tns",
			"items": 1,
			"center": true,
			"loop": false,
			"swipeAngle": false,
			"speed": 0,
			"controls": false,
			"nav": false
		});

		// Setup Event Listeners
		this._add_player_event = this._add_player_btn.addEventListener('click', () => this._addPlayer());
		this._generate_event = parent.querySelector('button[task=generate_teams]').addEventListener('click', () => this._generateTeams());
		this._return_to_gen_event = parent.querySelector('button[task=return]').addEventListener('click', () => this.tns.goTo(0));
	}

	_addPlayer() {
		let that = this;

		let name = (this._input_playername.value === "")? "-" : this._input_playername.value;
		let rating = (this._input_playerrating.value === "")? 0 : this._input_playerrating.value;

		// Create dom elements
		// <tr entry=[this._player_id]></tr>
		let table_row = cdm.createSimpleElement('tr', '', [['entry', this._player_id]]);

		// <td><input type="text" name="player_name_[this._player_id]" value="[this._input_playername.value]"></td>
		let td_name = cdm.createSimpleElement('td', 'name');
		let input_name = cdm.createSimpleElement('input', '', [['name', 'player_name_' + this._player_id],['value', name]]);
		td_name.appendChild(input_name);

		// <td><input type="text" name="player_name_[this._player_id]" value="[this._input_playerrating.value]"></td>
		let td_rating = cdm.createSimpleElement('td', 'rating');
		let input_rating = cdm.createSimpleElement('input', '', [['name', 'player_rating_' + this._player_id],['value', rating]]);
		td_rating.appendChild(input_rating)

		// <td><button>REMOVE</button></td>
		let td_remove = cdm.createSimpleElement('td', 'options');
		let btn_remove = cdm.createSimpleElement('button', '', [['target', this._player_id]], 'REMOVE');
		// Setup Remove Player eventlistener
		btn_remove.addEventListener('click', (e) => this._removePlayer(e.srcElement.getAttribute('target')));

		td_remove.appendChild(btn_remove);

		// Combine all Dom elements
		table_row.appendChild(td_name);
		table_row.appendChild(td_rating);
		table_row.appendChild(td_remove);

		this._playerlist_dom.appendChild(table_row);
		this._playerlist[this._player_id] = {name: name, rating: parseInt(rating)};

		this._updatePlayerCount(+1);
		this._player_id += 1;

		// Add Eventlistener for value change
		input_name.addEventListener('input', (e) => this._updatePlayer(e.target));
		input_rating.addEventListener('input', (e) => this._updatePlayer(e.target));

		return;
	}
	_updatePlayer(target) {
		let player_id = target.parentElement.parentElement.getAttribute('entry');
		let update_field = target.parentElement.className;

		if(update_field == 'name') {
			this._playerlist[player_id].name = target.value;
		}else {
			this._playerlist[player_id].rating = target.value;
		}

		return;
	}
	_removePlayer(target_id) {
		let entry = this._parent.querySelector('[entry="'+ target_id +'"]');
		entry.remove();

		this._playerlist.splice(target_id, 1)
		this._updatePlayerCount(-1);

		return;
	}
	_updatePlayerCount(value) {
		this._player_count += value;
		this._player_count_dom.innerHTML = this._player_count;

		return;
	}


	_generateTeams() {
		this._clearResults();

		let that = this;

		let team_amount = this._settings_team_amount_dom.value;
		let rating_enabled = this._settings_rating_enabled_dom.checked;
		let rating_inverted = this._settings_rating_inverted_dom.value;

		let copy_text = "";
		let copy_span = this._parent.querySelector('[copyid]');

		if(rating_enabled) {
			let playerlist_sorted = this._playerlist.slice();
			// Sort the list by rating and remove empty entries
			playerlist_sorted.sort((a, b) => a.rating - b.rating);
			playerlist_sorted = playerlist_sorted.filter(function (e) {
				return e; // Returns only the truthy values
			});

			// Loop playerlist until no one is left
			while(playerlist_sorted.length > 0) {
				let start_entries = playerlist_sorted.length;
				let copy_team_text = [];
				// Loop for the amount of teams that are wanted
				for (let i = 0; i < team_amount; i++) {
					// Check if Teamlist entry already exist
					if(!this._teamlist[i]) {
						this._teamlist[i] = [];
					}
					// Make sure playerlist has entries left
					if(playerlist_sorted[0]) {
						// add lowest entry and remove it
						this._teamlist[i].push(playerlist_sorted[0]);
						playerlist_sorted.shift();
					}
					// Check if there where enogh entries for double sorting
					if(start_entries >= team_amount*2) {
						// Make sure playerlist has entries left
						if(playerlist_sorted[playerlist_sorted.length-1]) {
							// add highest entry and remove it
							this._teamlist[i].push(playerlist_sorted[playerlist_sorted.length-1]);
							playerlist_sorted.pop();
						}
					}
				}
			}
		}else {
			let playerlist = this._playerlist.slice();

			// Loop playerlist until no one is left
			while(playerlist.length > 0) {
				console.log("START WHILE");

				for (let i = 0; i < team_amount; i++) {
					let random_entry = Math.floor(Math.random() * (playerlist.length));

					// Check if Teamlist entry already exist
					if(!this._teamlist[i]) {
						this._teamlist[i] = [];
					}
					// Make sure playerlist entry exist
					if(playerlist[random_entry]) {
						// add entry and remove it
						this._teamlist[i].push(playerlist[random_entry]);
						playerlist.splice(random_entry, 1);
					}else if(playerlist[0]){
						// add first entry and remove it
						this._teamlist[i].push(playerlist[0]);
						playerlist.shift();
					} else {
						playerlist = [];
					}

				}
			}
		}

		this._teamlist.forEach((team, index) => {
			let team_rating_total = 0; 
			let player_doms = [];

			let team_sorted = team.slice();
			team_sorted.sort((a, b) => a.rating - b.rating);

			team_sorted.forEach((player) => {
				player_doms.push(that._getPlayerDom(player));
				team_rating_total += player.rating;
			});
			let team_dom = that._getTeamDom(player_doms, index,  team_rating_total);

			copy_text += that._getTeamCopyText(team_sorted, index,  team_rating_total);
			copy_span.innerHTML = copy_text;

			that._result_teams_main_dom.appendChild(team_dom);
		});

		this.tns.goTo(1);
		return;
	}

	_getPlayerDom(player) {
		// <div class="player flexbox">
		//		<p class="name">[player.name]</p><p class="rating">[player.rating]</p>
		// </div>
		let div_player = cdm.createSimpleElement('div', '', [['class', 'player flexbox']]);
		let p_player_name = cdm.createSimpleElement('span', 'name', '', player.name);
		let p_player_rating = cdm.createSimpleElement('span', 'rating', '', player.rating.toString());
		div_player.appendChild(p_player_name);
		div_player.appendChild(p_player_rating);

		return div_player;
	}
	_getTeamDom(player_doms, team_index, team_rating_average) {
		// 	<div class="team">
		//		<p class="teamname">Team 1</p>
		//		<p class="teamrating">Teamrating: <span target="team_rating">1000</span></p>
		//		<div class="player flexbox">
		//			<p class="name">[player.name]</p><p class="rating">[player.rating]</p>
		//		</div>
		//	</div>
		let div_team = cdm.createSimpleElement('div', 'team');
		let p_team_name = cdm.createSimpleElement('p', 'teamname', '', 'Team ' + team_index);
		let p_team_rating = cdm.createSimpleElement('p', 'teamrating', '', 'Teamrating: ');
		let span_team_rating = cdm.createSimpleElement('span', '', [['target', 'team_rating']], team_rating_average.toString());
		p_team_rating.appendChild(span_team_rating);
		div_team.appendChild(p_team_name);
		div_team.appendChild(p_team_rating);

		player_doms.forEach((player_dom) => {
			div_team.appendChild(player_dom);
		});

		return div_team;
	}
	_getTeamCopyText(team, team_index, team_rating_average) {
		let copy_text = "";
		copy_text += 'Team ' + team_index + '\n';
		copy_text += 'Teamrating: ' + team_rating_average + '\n';
		
		team.forEach((player) => {
			copy_text += ' - ' + player.name + ' | ' + player.rating.toString() + '\n';
		});
		copy_text += '\n';

		return copy_text;
	}

	_clearResults() {
		this._teamlist = [];
		this._result_teams_main_dom.innerHTML = "";

		return;
	}
}