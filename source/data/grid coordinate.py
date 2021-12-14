
def generate_coordinates(coord_and_row_length, names_list):
    # this function generates grid coordinates the whole of Australia
    names_index = 0
    num_rows = len(coord_and_row_length)
    output_grids = []
    for j in range(num_rows):
        row = coord_and_row_length[j]
        start_coord = row[0]
        num_grids = row[1]
        for k in range(num_grids):
            grid_start_coord = [start_coord[0] + (1.5 * k), start_coord[1]]
            middle_of_grid = [grid_start_coord[0] + 0.75, grid_start_coord[1] - 0.5]  # middle of grid coordinate
            grid_coord_array = coordinates_for_grid(grid_start_coord)
            output_grids.append([names_list[names_index], middle_of_grid, grid_coord_array])
            names_index += 1
    return output_grids


def coordinates_for_grid(start_coord):
    # generates the grid coordinates set for one grid with a given start coordinate
    # start_coord is top left coordinate of left most grid
    bottom_right = [start_coord[0] + 1.5, start_coord[1] - 1]
    bottom_left = [start_coord[0], start_coord[1] - 1]
    top_left = start_coord
    top_right = [start_coord[0] + 1.5, start_coord[1]]
    # grid coordinate is bottom-right coordinate, bottom-left coordinate, top-left coordinate, top-right coordinate,
    # and bottom-right coordinate
    coord_array = [bottom_right, bottom_left, top_left, top_right, bottom_right]
    return coord_array


def main():
    # start coordinate for each row
    start_coord_and_row_iterations = [[[141.75, -10], 1], [[129, -11], 6], [[141, -11], 2], [[129, -12], 6], [[141, -12], 2], [[126, -13], 1], [[129, -13], 6], [[141, -13], 2], [[123, -14], 10], [[141, -14], 3], [[123, -15], 10], [[141, -15], 3], [[121.5, -16], 17], [[121.5, -17], 17], [[121.5, -18], 17], [[118.5, -19], 20], [[114, -20], 24], [[114, -21], 25], [[112.5, -22], 26], [[112.5, -23], 27], [[112.5, -24], 28], [[112.5, -25], 28], [[112.5, -26], 27], [[114, -27], 27], [[114, -28], 27], [[114, -29], 27], [[114, -30], 27], [[115.5, -31], 25], [[115.5, -32], 9], [[132, -32], 14], [[114, -33], 7], [[133.5, -33], 12], [[114, -34], 4], [[121.5, -34], 2], [[135, -34], 11], [[115.5, -35], 2], [[136.5, -35], 10], [[139.5, -36], 7], [[139.5, -37], 7], [[141, -38], 5], [[145, -40], 3], [[145, -41], 3], [[145, -42], 3], [[145, -43], 3]]
    # list of names for each grid
    names = ['Torres Strait', 'Bathurst Island', 'Melville Island', 'Cobourg Peninsula', 'Junction Bay', 'Wessel Islands', 'Truant Island', 'Jardine River', 'Orford Bay', 'Fog Bay', 'Darwin', 'Alligator River', 'Milingimbi', 'Arnhem Bay', 'Gove', 'Weipa', 'Cape Weymouth', 'Londonderry', 'Cape Scott', 'Pine Creek', 'Mount Evelyn', 'Mount Marumba', 'Blue Mud Bay', 'Port Langdon', 'Aurukun', 'Coen', 'Browse Island', 'Montague Sound', 'Drysdale', 'Medusa Banks', 'Port Keats', 'Fergusson River', 'Katherine', 'Urapunga', 'Roper River', 'Cape Beatrice', 'Holroyd', 'Ebagoola', 'Cape Melville', 'Camden Sound', 'Prince Regent', 'Ashton', 'Cambridge Gulf', 'Auvergne', 'Delamere', 'Larrimah', 'Hodgson Downs', 'Mount Young', 'Pellew', 'Rutland Plains', 'Hann River', 'Cooktown', 'Pender', 'Yampi', 'Charnley', 'Mount Elizabeth', 'Lissadell', 'Waterloo', 'Victoria River Downs', 'Daly Waters', 'Tanumbirini', 'Bauhinia Downs', 'Robinson River', 'Mornington', 'Cape Van Diemen', 'Galbraith', 'Walsh', 'Mossman', 'Cairns', 'Broome', 'Derby', 'Lennard River', 'Lansdowne', 'Dixon Range', 'Limbunya', 'Wave Hill', 'Newcastle Waters', 'Beetaloo', 'Wallhallow', 'Calvert Hills', 'Westmoreland', 'Burketown', 'Normanton', 'Red River', 'Atherton', 'Innisfail', 'Lagrange', 'Mount Anderson', 'Noonkanbah', 'Mount Ramsay', 'Gordon Downs', 'Birrindudu', 'Winnecke Creek', 'South Lake Woods', 'Helen Springs', 'Brunette Downs', 'Mount Drummond', 'Lawn Hill', 'Donors Hill', 'Croydon', 'Georgetown', 'Einasleigh', 'Ingham', 'Bedout Island', 'Mandora', 'Munro', 'McLarty Hills', 'Crossland', 'Mount Bannerman', 'Billiluna', 'Tanami', 'Tanami East', 'Green Swamp Well', 'Tennant Creek', 'Alroy', 'Ranken', 'Camooweal', 'Dobbyn', 'Millungera', 'Gilberton', 'Clarke River', 'Townsville', 'Ayr', 'Barrow Island', 'Dampier', 'Roebourne', 'Port Hedland', 'Yarrie', 'Anketell', 'Joanna Spring', 'Dummer', 'Cornish', 'Lucas', 'The Granites', 'Mount Solitaire', 'Lander River', 'Bonney Well', 'Frew River', 'Avon Downs', 'Mount Isa', 'Cloncurry', 'Julia Creek', 'Richmond', 'Hughenden', 'Charters Towers', 'Bowen', 'Proserpine', 'Onslow', 'Yarraloola', 'Pyramid', 'Marble Bar', 'Nullagine', 'Paterson Range', 'Sahara', 'Percival', 'Helena', 'Stansmore', 'Highland Rocks', 'Mount Theo', 'Mount Peake', 'Barrow Creek', 'Elekdra', 'Sandover River', 'Urandangi', 'Duchess', 'McKinlay', 'Manuka', 'Tangorin', 'Buchanan', 'Mount Coolon', 'Mackay', 'Percy Isles', 'Ningaloo', 'Yanrey', 'Wyloo', 'Mount Bruce', 'Roy Hill', 'Balfour Downs', 'Rudall', 'Tabletop', 'Ural', 'Wilson', 'Webb', 'Lake Mackay', 'Mount Doreen', 'Napperby', 'Alcoota', 'Huckitta', 'Tobermory', 'Glenormiston', 'Boulia', 'Mackunda', 'Winton', 'Muttaburra', 'Galilee', 'Clermont', 'St Lawrence', 'Port Clinton', 'Minilya', 'Winning Pool', 'Edmund', 'Turee Creek', 'Newman', 'Robertson', 'Gunanya', 'Runton', 'Morris', 'Ryan', 'Macdonald', 'Mount Rennie', 'Mount Liebig', 'Hermannsburg', 'Alice Springs', 'Illogwa Creek', 'Hay River', 'Mount Whelan', 'Springvale', 'Brighton Downs', 'Maneroo', 'Longreach', 'Jericho', 'Emerald', 'Duaringa', 'Rockhampton', 'Heron Island', 'Quobba', 'Kennedy Range', 'Mount Phillips', 'Mount Egerton', 'Collier', 'Bullen', 'Trainor', 'Madley', 'Warri', 'Cobb', 'Rawlinson', 'Bloods Range', 'Lake Amadeus', 'Henbury', 'Rodinga', 'Hale River', 'Simpson Desert North', 'Bedourie', 'Machattie', 'Connemara', 'Jundah', 'Blackall', 'Tambo', 'Springsure', 'Baralaba', 'Monto', 'Bundaberg', 'Sandy Cape', 'Shark Bay', 'Wooramel', 'Glenburgh', 'Robinson Range', 'Peak Hill', 'Nabberu', 'Stanley', 'Herbert', 'Browne', 'Bentley', 'Scott', 'Petermann Ranges', 'Ayers Rock', 'Kulgera', 'Finke', 'McDills', 'Simpson Desert South', 'Birdsville', 'Betoota', 'Canterbury', 'Windorah', 'Adavale', 'Augathella', 'Eddystone', 'Taroom', 'Mundubbera', 'Maryborough', 'Wide Bay', 'Edel', 'Yaringa', 'Byro', 'Belele', 'Glengarry', 'Wiluna', 'Kingston', 'Robert', 'Yowalga', 'Talbot', 'Cooper', 'Mann', 'Woodroffe', 'Alberga', 'Abminga', 'Dalhousie', 'Poolowanna', 'Pandie Pandie', 'Cordillo', 'Barrolka', 'Eromanga', 'Quilpie', 'Charleville', 'Mitchell', 'Roma', 'Chinchilla', 'Gympie', 'Ajana', 'Murgoo', 'Cue', 'Sandstone', 'Sir Samuel', 'Duketon', 'Throsell', 'Westwood', 'Lennis', 'Waigen', 'Birksgate', 'Lindsay', 'Everard', 'Wintinna', 'Oodnadatta', 'Noolyeana', 'Gason', 'Innamincka', 'Durham Downs', 'Thargomindah', 'Toompine', 'Wyandra', 'Homeboin', 'Surat', 'Dalby', 'Ipswich', 'Brisbane', 'Geraldton', 'Yalgoo', 'Kirkalocka', 'Youanmi', 'Leonora', 'Laverton', 'Rason', 'Neale', 'Vernon', 'Wanna', 'Noorina', 'Wells', 'Giles', 'Murloocoppie', 'Warrina', 'Lake Eyre', 'Kopperamanna', 'Strzelecki', 'Tickalara', 'Bulloo', 'Eulo', 'Cunnamulla', 'Dirranbandi', 'St George', 'Goondwindi', 'Warwick', 'Tweed Heads', 'Dongara', 'Perenjori', 'Ninghan', 'Barlee', 'Menzies', 'Edjudina', 'Minigwal', 'Plumridge', 'Jubilee', 'Mason', 'Wyola', 'Maurice', 'Tallaringa', 'Coober Pedy', 'Billa Kalina', 'Curdimurka', 'Marree', 'Callabonna', 'Milparinka', 'Urisino', 'Yantabulla', 'Enngonia', 'Angledool', 'Moree', 'Inverell', 'Grafton', 'Maclean', 'Hill River', 'Moora', 'Bencubbin', 'Jackson', 'Kalgoorlie', 'Kurnalpi', 'Cundeelee', 'Seemore', 'Loongana', 'Forrest', 'Cook', 'Ooldea', 'Barton', 'Tarcoola', 'Kingoonya', 'Andamooka', 'Copley', 'Frome', 'Cobham Lake', 'White Cliffs', 'Louth', 'Bourke', 'Walgett', 'Narrabri', 'Manilla', 'Dorrigo', 'Coffs Harbour', 'Perth', 'Kellerberrin', 'Southern Cross', 'Boorabbin', 'Widgiemooltha', 'Zanthus', 'Naretha', 'Madura', 'Eucla', 'Coompana', 'Nullarbor', 'Fowler', 'Childara', 'Gairdner', 'Torrens', 'Parachilna', 'Curnamona', 'Broken Hill', 'Wilcannia', 'Barnato', 'Cobar', 'Nyngan', 'Gilgandra', 'Tamworth', 'Hastings', 'Pinjarra', 'Corrigin', 'Hyden', 'Lake Johnston', 'Norseman', 'Balladonia', 'Culver', 'Burnabbie', 'Noonaera', 'Nuyts', 'Streaky Bay', 'Yardea', 'Port Augusta', 'Orroroo', 'Olary', 'Menindee', 'Manara', 'Ivanhoe', 'Nymagee', 'Narromine', 'Dubbo', 'Singleton', 'Newcastle', 'Busselton', 'Collie', 'Dumbleyung', 'Newdegate', 'Ravensthorpe', 'Esperance', 'Malcolm', 'Elliston', 'Kimba', 'Whyalla', 'Burra', 'Chowilla', 'Ana Branch', 'Pooncarie', 'Booligal', 'Cargelligo', 'Forbes', 'Bathurst', 'Sydney', 'Augusta', 'Pemberton', 'Mount Barker', 'Bremer Bay', 'Mondrain Island', 'Cape Arid', 'Lincoln', 'Maitland', 'Adelaide', 'Renmark', 'Mildura', 'Balranald', 'Hay', 'Narrandera', 'Cootamundra', 'Goulburn', 'Wollongong', 'Irwin Inlet', 'Albany', 'Kingscote', 'Barker', 'Pinnaroo', 'Ouyen', 'Swan Hill', 'Deniliquin', 'Jerilderie', 'Wagga Wagga', 'Canberra', 'Ulladulla', 'Naracoorte', 'Horsham', 'St Arnaud', 'Bendigo', 'Wangaratta', 'Tallangatta', 'Bega', 'Penola', 'Hamilton', 'Ballarat', 'Melbourne', 'Warburton', 'Bairnsdale', 'Mallacoota', 'Portland', 'Colac', 'Queenscliff', 'Warragul', 'Sale', 'King Island', 'Bass Strait', 'Flinders Island', 'Burnie', 'Devonport', 'Launceston', 'Queenstown', 'Waddamana', 'Oatlands', 'Port Davey', 'Huon River', 'Hobart']
    #  don't change the above two variables, the ordering is important for the names to match up
    output = generate_coordinates(start_coord_and_row_iterations, names)
    print(output)
    print("Number of grids: {}".format(len(output)))
    """
    for i in range(543):
    grid = output[i]
    grid_name = "Sale"
    if grid[0] == grid_name:
        print(grid)
    """


if __name__ == '__main__':
    main()