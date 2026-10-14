-- =====================================================================
-- cookbook.db : data import
-- Run in DB Browser for SQLite > "Execute SQL" tab (Ctrl+Return),
-- then "Write Changes" (Ctrl+S).
-- Meant for EMPTY tables (explicit IDs are used so everything links up).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. USERS (the recipe authors)
--    PLACEHOLDERS: email, password_hash, country and role are invented
--    because the source data only had names. Edit them as needed.
-- ---------------------------------------------------------------------
INSERT INTO user_account (user_id, firstname, lastname, email, password_hash, country, gender, role) VALUES
(1,  'Sara',    'Kelley',          'sara.kelley@example.com',          'CHANGE_ME', 'Unknown', NULL, 'user'),
(2,  'John',    'O''Connor',       'john.oconnor@example.com',         'CHANGE_ME', 'Unknown', NULL, 'user'),
(3,  'Debbie',  'Birmingham',      'debbie.birmingham@example.com',    'CHANGE_ME', 'Unknown', NULL, 'user'),
(4,  'Damien',  'Nguyen',          'damien.nguyen@example.com',        'CHANGE_ME', 'Unknown', NULL, 'user'),
(5,  'Giani',   'Livrieri',        'giani.livrieri@example.com',       'CHANGE_ME', 'Unknown', NULL, 'user'),
(6,  'Anja',    'Weisser',         'anja.weisser@example.com',         'CHANGE_ME', 'Unknown', NULL, 'user'),
(7,  'Wendy',   'Heyward',         'wendy.heyward@example.com',        'CHANGE_ME', 'Unknown', NULL, 'user'),
(8,  'Sandra',  'Novelli-Riquer',  'sandra.novelli-riquer@example.com','CHANGE_ME', 'Unknown', NULL, 'user'),
(9,  'Gaetano', 'Cremonese',       'gaetano.cremonese@example.com',    'CHANGE_ME', 'Unknown', NULL, 'user'),
(10, 'Julien',  'Ndiaye',          'julien.ndiaye@example.com',        'CHANGE_ME', 'Unknown', NULL, 'user');

-- ---------------------------------------------------------------------
-- 2. CATEGORIES (the old "type" field)
-- ---------------------------------------------------------------------
INSERT INTO category (category_id, category_name) VALUES
(1, 'Italian'),
(2, 'Meat'),
(3, 'Sashimi and sushi'),
(4, 'Sweet & sour'),
(5, 'Cake'),
(6, 'Homemade hamburgers');

-- ---------------------------------------------------------------------
-- 3. RECIPES
--    prep_time / cook_time are in MINUTES.
--    Rising / chilling time is added to prep_time:
--      Four season pizza : 20 + 60  = 80
--      Tiramisù          : 30 + 360 = 390
--      Cheesecake        : 25 + 360 = 385
--      Roastbeef cook    : 1 h 15   = 75
-- ---------------------------------------------------------------------
INSERT INTO recipe (recipe_id, user_id, recipe_name, img_url, prep_time, cook_time, servings) VALUES
(1,  1,  'Arrabiata pasta',        'assets/images/arrabiata_pasta.jpg',        10,  20, 4),
(2,  2,  'Roastbeef & potatoes',   'assets/images/roastbeef_potatoes.jpg',     20,  75, 6),
(3,  3,  'Tuna sushi',             'assets/images/tuna_sushi.jpg',             45,  20, 4),
(4,  4,  'Spring rolls',           'assets/images/spring_rolls.jpg',           30,  15, 4),
(5,  5,  'Four season pizza',      'assets/images/four_season_pizza.jpg',      80,  12, 2),
(6,  6,  'Tiramisù',               'assets/images/tiramisu.jpg',              390,   0, 8),
(7,  7,  'Blue cheese hamburger',  'assets/images/blue_cheese_hamburger.jpg',  15,  12, 4),
(8,  8,  'Cheesecake',             'assets/images/cheesecake.jpg',            385,  55, 10),
(9,  8,  'Bruschetta',             'assets/images/bruschetta.jpg',             15,   5, 4),
(10, 9,  'Caprese salad',          'assets/images/caprese_salad.jpg',          10,   0, 4),
(11, 10, 'Mini hamburgers',        'assets/images/mini_hamburgers.jpg',        20,  10, 6),
(12, 6,  'Chocolate cake',         'assets/images/chocolate_cake.jpg',         25,  35, 10);

-- ---------------------------------------------------------------------
-- 4. RECIPE <-> CATEGORY
-- ---------------------------------------------------------------------
INSERT INTO recipe_category (recipe_id, category_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 1), (6, 5),
(7, 6), (8, 5), (9, 1), (10, 1), (11, 6), (12, 5);

-- ---------------------------------------------------------------------
-- 5. INGREDIENTS
--    Staging table -> fills `ingredient` (unique names) and
--    `recipe_ingredient` (quantity + unit) automatically.
--    NULL quantity = "to taste / to serve / as needed".
-- ---------------------------------------------------------------------
CREATE TEMP TABLE temp_ingredient (
    recipe_id       INTEGER,
    ingredient_name TEXT,
    quantity        REAL,
    unit            TEXT
);

INSERT INTO temp_ingredient (recipe_id, ingredient_name, quantity, unit) VALUES
-- 1 Arrabiata pasta
(1, 'penne',                   400,  'g'),
(1, 'canned peeled tomatoes',  400,  'g'),
(1, 'garlic',                  3,    'clove'),
(1, 'dried red chilli',        1,    NULL),
(1, 'extra virgin olive oil',  3,    'tbsp'),
(1, 'fresh parsley',           1,    'handful'),
(1, 'salt',                    NULL, NULL),
(1, 'pecorino romano',         NULL, 'to serve'),
-- 2 Roastbeef & potatoes
(2, 'beef roasting joint',     1.5,  'kg'),
(2, 'potatoes',                1,    'kg'),
(2, 'olive oil',               4,    'tbsp'),
(2, 'garlic',                  4,    'clove'),
(2, 'fresh rosemary',          3,    'sprig'),
(2, 'dijon mustard',           1,    'tbsp'),
(2, 'sea salt',                2,    'tsp'),
(2, 'black pepper',            1,    'tsp'),
(2, 'beef stock',              250,  'ml'),
-- 3 Tuna sushi
(3, 'sushi rice',              300,  'g'),
(3, 'water',                   360,  'ml'),
(3, 'rice vinegar',            4,    'tbsp'),
(3, 'sugar',                   2,    'tbsp'),
(3, 'salt',                    1,    'tsp'),
(3, 'sushi-grade tuna',        250,  'g'),
(3, 'wasabi paste',            NULL, NULL),
(3, 'soy sauce',               NULL, 'to serve'),
(3, 'pickled ginger',          NULL, 'to serve'),
-- 4 Spring rolls
(4, 'spring roll wrappers',    12,   NULL),
(4, 'glass noodles',           100,  'g'),
(4, 'carrots',                 2,    NULL),
(4, 'white cabbage',           200,  'g'),
(4, 'minced pork',             150,  'g'),
(4, 'spring onions',           3,    NULL),
(4, 'garlic',                  2,    'clove'),
(4, 'soy sauce',               1,    'tbsp'),
(4, 'vegetable oil',           NULL, 'for frying'),
(4, 'sweet chilli sauce',      NULL, 'to serve'),
-- 5 Four season pizza
(5, 'strong bread flour',      300,  'g'),
(5, 'water',                   200,  'ml'),
(5, 'dried yeast',             7,    'g'),
(5, 'salt',                    1,    'tsp'),
(5, 'olive oil',               1,    'tbsp'),
(5, 'tomato passata',          120,  'g'),
(5, 'mozzarella',              150,  'g'),
(5, 'artichoke hearts in oil', 4,    NULL),
(5, 'cooked ham',              4,    'slice'),
(5, 'black olives',            6,    NULL),
(5, 'button mushrooms',        4,    NULL),
(5, 'fresh basil',             NULL, NULL),
-- 6 Tiramisù
(6, 'mascarpone',                           500, 'g'),
(6, 'eggs',                                 4,   NULL),
(6, 'caster sugar',                         100, 'g'),
(6, 'espresso',                             300, 'ml'),
(6, 'marsala or coffee liqueur (optional)', 3,   'tbsp'),
(6, 'savoiardi',                            200, 'g'),
(6, 'unsweetened cocoa powder',             NULL,'for dusting'),
-- 7 Blue cheese hamburger
(7, 'minced beef',             600,  'g'),
(7, 'brioche burger buns',     4,    NULL),
(7, 'blue cheese',             120,  'g'),
(7, 'red onion',               1,    NULL),
(7, 'butter',                  1,    'tbsp'),
(7, 'rocket',                  1,    'handful'),
(7, 'tomatoes',                1,    NULL),
(7, 'salt',                    NULL, NULL),
(7, 'black pepper',            NULL, NULL),
(7, 'mustard',                 2,    'tbsp'),
-- 8 Cheesecake
(8, 'digestive biscuits',      250,  'g'),
(8, 'butter',                  100,  'g'),
(8, 'cream cheese',            600,  'g'),
(8, 'caster sugar',            150,  'g'),
(8, 'eggs',                    3,    NULL),
(8, 'sour cream',              200,  'ml'),
(8, 'vanilla extract',         1,    'tsp'),
(8, 'lemon zest',              1,    'lemon'),
(8, 'plain flour',             2,    'tbsp'),
(8, 'fresh berries or fruit coulis', NULL, 'to serve'),
-- 9 Bruschetta
(9, 'rustic country bread',    8,    'slice'),
(9, 'tomatoes',                500,  'g'),
(9, 'garlic',                  2,    'clove'),
(9, 'extra virgin olive oil',  4,    'tbsp'),
(9, 'fresh basil',             1,    'handful'),
(9, 'balsamic vinegar',        1,    'tsp'),
(9, 'salt',                    NULL, NULL),
(9, 'black pepper',            NULL, NULL),
-- 10 Caprese salad
(10, 'tomatoes',               4,    NULL),
(10, 'buffalo mozzarella',     250,  'g'),
(10, 'fresh basil',            1,    'bunch'),
(10, 'extra virgin olive oil', 3,    'tbsp'),
(10, 'sea salt',               NULL, NULL),
(10, 'black pepper',           NULL, NULL),
(10, 'balsamic glaze (optional)', NULL, NULL),
-- 11 Mini hamburgers
(11, 'minced beef',            500,  'g'),
(11, 'mini burger buns',       12,   NULL),
(11, 'cheddar',                6,    'slice'),
(11, 'lettuce',                12,   'leaf'),
(11, 'tomatoes',               2,    NULL),
(11, 'pickles',                12,   'slice'),
(11, 'ketchup',                3,    'tbsp'),
(11, 'mustard',                2,    'tbsp'),
(11, 'salt',                   NULL, NULL),
(11, 'black pepper',           NULL, NULL),
(11, 'vegetable oil',          1,    'tbsp'),
-- 12 Chocolate cake
(12, 'plain flour',               200, 'g'),
(12, 'caster sugar',              200, 'g'),
(12, 'unsweetened cocoa powder',  75,  'g'),
(12, 'baking powder',             1.5, 'tsp'),
(12, 'bicarbonate of soda',       1,   'tsp'),
(12, 'eggs',                      2,   NULL),
(12, 'milk',                      250, 'ml'),
(12, 'vegetable oil',             120, 'ml'),
(12, 'vanilla extract',           1,   'tsp'),
(12, 'hot coffee',                250, 'ml'),
(12, 'dark chocolate',            200, 'g'),
(12, 'double cream',              200, 'ml');

INSERT OR IGNORE INTO ingredient (ingredient_name)
SELECT DISTINCT ingredient_name FROM temp_ingredient ORDER BY ingredient_name;

INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit)
SELECT t.recipe_id, i.ingredient_id, t.quantity, t.unit
FROM temp_ingredient t
JOIN ingredient i ON i.ingredient_name = t.ingredient_name;

DROP TABLE temp_ingredient;

-- ---------------------------------------------------------------------
-- 6. PREPARATION STEPS
--    Staging table -> fills `preparation_step` and `recipe_step`.
-- ---------------------------------------------------------------------
CREATE TEMP TABLE temp_step (
    seq         INTEGER PRIMARY KEY,
    recipe_id   INTEGER,
    step_number INTEGER,
    instruction TEXT
);

INSERT INTO temp_step (recipe_id, step_number, instruction) VALUES
-- 1 Arrabiata pasta
(1, 1, 'Bring a large pot of salted water to the boil.'),
(1, 2, 'Heat the olive oil in a pan over medium heat and gently fry the garlic and chilli for 1-2 minutes, without letting the garlic brown.'),
(1, 3, 'Crush the tomatoes with your hands, add them to the pan with a pinch of salt and simmer for 15 minutes until the sauce thickens.'),
(1, 4, 'Cook the penne until al dente, then drain, reserving a cup of pasta water.'),
(1, 5, 'Toss the pasta in the sauce, adding a splash of pasta water to loosen it if needed.'),
(1, 6, 'Finish with parsley and Pecorino, and serve immediately.'),
-- 2 Roastbeef & potatoes
(2, 1, 'Take the beef out of the fridge 1 hour before cooking and preheat the oven to 220°C (200°C fan).'),
(2, 2, 'Rub the beef with mustard, 2 tbsp olive oil, garlic, salt and pepper.'),
(2, 3, 'Parboil the potatoes in salted water for 8 minutes, drain and shake them in the colander to roughen the edges.'),
(2, 4, 'Toss the potatoes with the remaining oil and rosemary and spread them around a roasting tray, placing the beef in the middle.'),
(2, 5, 'Roast for 20 minutes at 220°C, then reduce to 180°C (160°C fan) and roast for a further 40-50 minutes for medium-rare.'),
(2, 6, 'Rest the beef, covered in foil, for 20 minutes while the potatoes finish crisping.'),
(2, 7, 'Deglaze the tray with the beef stock over heat to make a quick gravy, then carve the beef and serve.'),
-- 3 Tuna sushi
(3, 1, 'Rinse the rice under cold water until the water runs clear, then cook it with the water in a covered pot for about 15 minutes and rest for 10 minutes.'),
(3, 2, 'Warm the rice vinegar with the sugar and salt until dissolved, then fold it through the hot rice and let it cool to room temperature.'),
(3, 3, 'Slice the tuna against the grain into 5 mm thick slices.'),
(3, 4, 'Wet your hands, shape about 25 g of rice into a small oval and dab a little wasabi on top.'),
(3, 5, 'Press a slice of tuna on top of each rice oval.'),
(3, 6, 'Serve with soy sauce, pickled ginger and extra wasabi.'),
-- 4 Spring rolls
(4, 1, 'Soak the glass noodles in hot water for 5 minutes, drain and cut into short lengths.'),
(4, 2, 'Stir-fry the garlic and pork for 3-4 minutes until cooked, then add the carrots and cabbage and cook for 2 minutes more.'),
(4, 3, 'Add the soy sauce, spring onions and noodles, mix well and leave the filling to cool.'),
(4, 4, 'Place 2 tbsp of filling near a corner of a wrapper, fold in the sides and roll up tightly, sealing the edge with a little water.'),
(4, 5, 'Heat about 3 cm of oil to 180°C and fry the rolls in batches for 3-4 minutes until golden and crisp.'),
(4, 6, 'Drain on kitchen paper and serve hot with sweet chilli sauce.'),
-- 5 Four season pizza
(5, 1, 'Mix the flour, yeast and salt, add the water and olive oil, and knead for 10 minutes until smooth and elastic.'),
(5, 2, 'Cover the dough and leave it to rise in a warm place for about 1 hour, until doubled in size.'),
(5, 3, 'Preheat the oven to its highest setting (about 250°C) with a baking tray inside.'),
(5, 4, 'Roll out the dough into a round, spread with passata and scatter over the mozzarella.'),
(5, 5, 'Divide the pizza into four sections and top each with one of the ingredients: artichokes, ham, olives and mushrooms.'),
(5, 6, 'Bake for 10-12 minutes until the crust is golden and the cheese is bubbling.'),
(5, 7, 'Finish with fresh basil and serve.'),
-- 6 Tiramisù
(6, 1, 'Whisk the egg yolks with the sugar until pale and creamy, then beat in the mascarpone until smooth.'),
(6, 2, 'In a clean bowl, whisk the egg whites to stiff peaks and gently fold them into the mascarpone mixture.'),
(6, 3, 'Mix the cooled espresso with the Marsala, then quickly dip each biscuit and lay them in a single layer in a dish.'),
(6, 4, 'Spread half of the cream over the biscuits, then repeat with another layer of dipped biscuits and the remaining cream.'),
(6, 5, 'Cover and refrigerate for at least 6 hours, ideally overnight.'),
(6, 6, 'Dust generously with cocoa powder just before serving.'),
-- 7 Blue cheese hamburger
(7, 1, 'Gently mix the beef with salt and pepper and shape into 4 patties, pressing a small dimple in the centre of each.'),
(7, 2, 'Melt the butter in a pan and cook the onion slowly for 8-10 minutes until soft and golden.'),
(7, 3, 'Grill or pan-fry the patties over high heat for 4-5 minutes per side for medium.'),
(7, 4, 'In the last minute of cooking, top each patty with blue cheese and cover the pan so it melts.'),
(7, 5, 'Toast the buns, spread with mustard, and layer with rocket, tomato, the patty and caramelised onions.'),
(7, 6, 'Serve straight away.'),
-- 8 Cheesecake
(8, 1, 'Preheat the oven to 160°C (140°C fan) and line the base of a 23 cm springform tin.'),
(8, 2, 'Crush the biscuits, mix with the melted butter and press firmly into the base of the tin, then chill for 15 minutes.'),
(8, 3, 'Beat the cream cheese with the sugar until smooth, then beat in the eggs one at a time.'),
(8, 4, 'Stir in the sour cream, vanilla, lemon zest and flour until just combined.'),
(8, 5, 'Pour the filling over the base and bake for 50-55 minutes, until set at the edges with a slight wobble in the centre.'),
(8, 6, 'Turn off the oven and leave the cheesecake inside with the door ajar for 1 hour, then chill in the fridge for at least 6 hours.'),
(8, 7, 'Release from the tin and serve topped with berries or coulis.'),
-- 9 Bruschetta
(9, 1, 'Combine the tomatoes, minced garlic, half of the olive oil, basil, balsamic vinegar, salt and pepper, and let the mixture rest for 10 minutes.'),
(9, 2, 'Toast or grill the bread slices until golden and crisp on both sides.'),
(9, 3, 'Rub one side of each hot slice with the cut garlic clove.'),
(9, 4, 'Spoon the tomato mixture generously over the toast.'),
(9, 5, 'Drizzle with the remaining olive oil and serve immediately.'),
-- 10 Caprese salad
(10, 1, 'Slice the tomatoes and mozzarella into 5 mm thick rounds.'),
(10, 2, 'Arrange them on a platter, alternating and overlapping the slices with basil leaves tucked between.'),
(10, 3, 'Season with sea salt and black pepper.'),
(10, 4, 'Drizzle with olive oil and, if you like, a little balsamic glaze.'),
(10, 5, 'Let the salad sit at room temperature for 5 minutes before serving.'),
-- 11 Mini hamburgers
(11, 1, 'Season the beef with salt and pepper and shape into 12 small patties, about 40 g each.'),
(11, 2, 'Heat the oil in a large frying pan over high heat and cook the patties for 2-3 minutes per side.'),
(11, 3, 'Top each patty with a half slice of cheddar and let it melt for 30 seconds.'),
(11, 4, 'Lightly toast the cut sides of the mini buns.'),
(11, 5, 'Spread the buns with ketchup and mustard, then layer with lettuce, tomato, the patty and a pickle slice.'),
(11, 6, 'Secure each burger with a cocktail stick and serve warm.'),
-- 12 Chocolate cake
(12, 1, 'Preheat the oven to 180°C (160°C fan) and grease and line two 20 cm round cake tins.'),
(12, 2, 'Whisk the flour, sugar, cocoa, baking powder and bicarbonate of soda together in a large bowl.'),
(12, 3, 'In a jug, beat the eggs with the milk, oil and vanilla, then pour into the dry ingredients and mix until smooth.'),
(12, 4, 'Stir in the hot coffee to give a thin batter, then divide it between the tins.'),
(12, 5, 'Bake for 30-35 minutes, until a skewer inserted in the centre comes out clean, then cool in the tins for 10 minutes before turning out onto a wire rack.'),
(12, 6, 'Heat the cream until just steaming, pour it over the broken chocolate and stir until glossy to make a ganache, then let it thicken slightly.'),
(12, 7, 'Sandwich the cooled cakes with some ganache and spread the rest over the top and sides.');

INSERT INTO preparation_step (step_id, step_number, instruction)
SELECT seq, step_number, instruction FROM temp_step ORDER BY seq;

INSERT INTO recipe_step (recipe_id, step_id, step_number)
SELECT recipe_id, seq, step_number FROM temp_step ORDER BY seq;

DROP TABLE temp_step;

-- ---------------------------------------------------------------------
-- 7. QUICK CHECK (optional): expect 12 recipes, 74 steps
-- ---------------------------------------------------------------------
-- SELECT r.recipe_name, u.firstname || ' ' || u.lastname AS author,
--        c.category_name, r.prep_time, r.cook_time, r.servings
-- FROM recipe r
-- JOIN user_account u USING(user_id)
-- JOIN recipe_category rc USING(recipe_id)
-- JOIN category c USING(category_id);
--
-- SELECT COUNT(*) FROM recipe_step;        -- 74
-- SELECT COUNT(*) FROM recipe_ingredient;  -- 113
