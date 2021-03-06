let emptyHand = [[-1, false], [0, false], [0, false], [0, false], [0, false]];
let onTop = [none, none, none, none, undefined, none];
sceneManager.addScene(
	"MENU",
	3, 6,
	[[Erlenmeyer.id, 0, 1, 2, false, [60, r4]]],
	[],
	emptyHand,
	[["<img src='img/title.png'></img><small>appuyez sur les flèches directionnelles pour faire avancer le jeu, ou revenir en arrière</small>", 0, none, none, "18vw", "50%", none],
	],
	true
);

sceneManager.addScene(
	"HELLO",
	3, 6,
	[[Erlenmeyer.id, 0, 1, 2, false, [60, r4]]],
	[],
	emptyHand,
	[["Bonjour Disciple"],
	 ["Il est temps de me montrer que vous êtes à la hauteur de mes attentes", ...onTop],
	 ["Vous serez confronté à 10 épreuves. Seulement si vous arrivez à toutes les passer, je vous accorderai de m'aider dans mes expériences", ...onTop],
	 ["Pour chaque épreuve je poserai sur la table de la verrerie que je vous interdis de déplacer\n☚", "14vw", none, "20vw", none, "50%", none],
	 ["Ainsi que de la verrerie dont vous disposerez à votre guise\n☛", 0, none, 0, none, "30%", none],
	 ["Vous pourrez utiliser autant de tuyauterie que vous le désirez", 0, none, 0, none, "30%", none],
	 ["Je vous rappelle que nous, les Alchimistes de Platos, ne manipulons que les 5 éléments purs :", ...onTop],
	 ["le feu ◀ et sa symétrie ▶", "13vw", none, none, none, undefined, none],
	 ["le feu ◀ et sa symétrie ▶\nl'argent ◗ et sa symétrie ◖", "13vw", none, none, none, undefined, none],
	 ["le feu ◀ et sa symétrie ▶\nl'argent ◗ et sa symétrie ◖\net l'or ◉", "13vw", none, none, none, undefined, none],
	 ["Tout autre élément peut être obtenu par la combinaison de ces 5 primitives", ...onTop],
	 ["En passant votre curseur vide (déjà sélectionné) ☛\nsur un élément de la verrerie", 0, none, 0, none, none, none],
	 ["Vous pouvez afficher la composition de la solution contenue\n☚", "20vw", none, none, "11vw", "60%", none],
	],
	true
);

sceneManager.addScene(
	"LVL_1",
	3, 6,
	[[Erlenmeyer.id, 0, 1, 2, false, [192, V]],
	 [Erlenmeyer.id, 2, 2, 1, false, [24, O]],
	 [Vessel.id, 3, 2, 1, false, [24, O]],
	 [Vessel.id, 4, 1, 2, false, [192, V]],
	],
	[],
	emptyHand,
	[["Nous commençons en douceur disciple", ...onTop],
	 ["Je vous prie de constater que toute la petite verrerie a une contenance maximale de 24 unités", "1vw", none, none, "20vw", "30%", none],
	 ["tandis que la grande verrerie a une contenance maximale de 192 unités", 0, none, none, 0, "40%", none],
	 ["Ces fioles sphériques sont les témoins de votre réussite, seul leur contenu final compte", "3vw", none, 0, none, "58%", none],
	 ["Pour commencer je vous demande simplement de transvaser 24 ◉ dans la petite fiole et 192 ◀ dans la grande", ...onTop],
	 ["En passant votre curseur vide sur les fioles vous pouvez voir, sous la composition de leur contenu, le résultat attendu ☛", "2vw", none, "11vw", none, "71%", none],
	 ["Afin d'effectuer le transfert vous devez utiliser des tuyaux", ...onTop],
	 ["Vous pouvez en placer avec votre curseur vide ☛\n(déjà sélectionné)", 0, none, 0, none, none, none],
	 ["En enfonçant le clic sur une sortie (indiquée en vert)\n☚", "2vw", none, none, "3vw", "32%", none],
	 ["et en étirant le tuyau jusqu'à une entrée (indiquée en rouge) ☛", "8vw", none, "15vw", none, "56%", none],
	 ["si le placement est valide, le tuyau doit s'illuminer, vous pouvez alors relâcher la souris", ...onTop],
	 ["Essayez !", ...onTop],
	 ["Vous pouvez retirer tout élément de verrerie et tuyauterie avec le clic droit, sauf ceux que j'ai moi-même posé bien sûr !", ...onTop],
	 ["Essayez !", ...onTop],
	 ["Une fois votre dispositif en place, vous pouvez appuyer sur la touche \"espace\" pour procéder à la réaction", ...onTop],
	 ["Remarquez que le carré de votre curseur est rouge tant que la réaction est en cours", ...onTop],
	 ["Attention disciple ! Je vous interdis de modifier votre installation tant que la réaction est en cours !", ...onTop],
	 ["Une seconde pression sur \"espace\" met en pause la reaction et vous permet de modifier de nouveau votre dispositif", ...onTop],
	 ["Seulement ne trichez pas disciple ! Je ne considère un montage correct que si la réaction n'est jamais interrompue", ...onTop],
	 ["A tout moment vous pouvez réinitialiser la réaction avec la touche \"entrée\"", ...onTop],
	 ["La touche \"retour arrière\" réinitialise tout votre montage, utilisez la avec prudence !", ...onTop],
	 ["Je pense en avoir assez dit disciple... C'est à vous de jouer !", ...onTop],
	 []
	],
	false
);

sceneManager.addScene(
	"LVL_2",
	3, 6,
	[[Erlenmeyer.id, 2, 2, 1, false, [24, new Molecule([-2,3,2])]],
	 [Vessel.id, 3, 2, 1, false, [8, O]],
	],
	[],
	[[-1, false], [0, false], [2, false], [2, false], [2, false]],
	[["Bien disciple", ...onTop],
	 ["Passons à la distillation", ...onTop],
	 ["Je vous prête 2 tours de distillation ☛\n\n\n2 étagères ☛\n\n\net 2 brûleurs ☛", none, 0, 0, none, "27%", none],
	 ["C'est plus que le nécessaire", none, "10vw", 0, none, "30%", none],
	 ["Vous pouvez selectionner un élément et tenter de le placer sur la table, votre curseur devient vert si la position est valide", ...onTop],
	 ["Remarquez que vous pouvez poser une étagère sur un élément ou un élément dans étagère", ...onTop],
	 ["Un élément ne peut être posé que sur la table ou sur une étagère", ...onTop],
	 ["Je vous invite à monter et démonter plusieurs configurations pour vous faire la main", ...onTop],
	 ["Maintenant que vous êtes familier avec le système de placement...", ...onTop],
	 ["je vous rappelle qu'une tour de distillation placée au-dessus d'un brûleur retire un élément au début et à la fin d'une chaine (si la chaine possède au moins 3 éléments)", ...onTop],
	 ["Sachant cela, je vous demande de raffiner autant que possible le contenu de cet Erlenmeyer ☛", none, "5vw", 0, "1vw", "37%", none],
	 []
	],
	false
);

sceneManager.addScene(
	"LVL_2.5",
	3, 6,
	[[Erlenmeyer.id, 0, 1, 2, false, [192, new Molecule([1,-1])]],
	 [Vessel.id, 3, 2, 1, false, [24, new Molecule([1,-1])]],
	 [Vessel.id, 4, 2, 1, false, [24, new Molecule([1,-1])]],
	 [Vessel.id, 5, 2, 1, false, [24, new Molecule([1,-1])]],
	],
	[],
	[[-1, false], [0, false], [1, false], [0, false], [0, false]],
	[["Bien disciple", ...onTop],
	 ["La distillation est un processus très utile, mais tâchez de ne pas oublier que l'on peut utiliser une tour de distillation sans brûleur", ...onTop],
	 []
	],
	false
);

sceneManager.addScene(
	"LVL_3",
	3, 6,
	[[Erlenmeyer.id, 0, 1, 2, false, [192, O]],
	 [Erlenmeyer.id, 2, 1, 2, false, [192, D]],
	 [Vessel.id, 5, 1, 1, true, [24, new Molecule([-2,3,2])]],
	 [Vessel.id, 5, 2, 1, true, [24, new Molecule([-2,3])]],
	],
	[],
	[[-1, false], [2, false], [0, false], [2, false], [0, false]],
	[["Bien disciple", ...onTop],
	 ["La fusion est la discipline la plus noble et la plus complexe, je vous prie donc d'être attentif !", ...onTop],
	 ["Tout d'abord un petit rappel sur les éléments compatibles, ça ne fait pas de mal :", ...onTop],
	 ["Compatibilité des extrémités plates : ◀▶, ◀◗, ◖◗", ...onTop],
	 ["Compatibilité des extrémités plates : ◀▶, ◀◗, ◖◗\nCompatibilité des extrémités pointues : ▶◀", ...onTop],
	 ["Compatibilité des extrémités plates : ◀▶, ◀◗, ◖◗\nCompatibilité des extrémités pointues : ▶◀\nCompatibilité des extrémités arrondies : ◗◖, ◗◉, ◉◉", ...onTop],
	 ["2 chaines peuvent être fusionnées à l'aide d'un bescher", ...onTop],
	 ["je vous conseille d'en prendre un et de le poser sur la table pour l'examiner ☛", "3vw", none, 0, none, "69%", none],
	 ["Comme vous pouvez le constater, un bescher a 2 entrées et une sortie", ...onTop],
	 ["Une entrée est dite primaire, l'autre secondaire", ...onTop],
	 ["Leur nature est décidée par leur ordre de raccordement (respectivement première et dernière)", ...onTop],
	 ["En passant votre curseur vide sur un bescher, vous pouvez voir qu'il indique 3 compositions", ...onTop],
	 ["Il s'agit, dans l'ordre : du réactif primaire, secondaire et du résultat de fusion", ...onTop],
	 ["La fusion se passe comme suit : la chaine secondaire est dupliquée et entoure la chaine primaire", ...onTop],
	 ["les extrémités compatibles fusionnent", ...onTop],
	 ["aux extrémités non compatibles, la chaine secondaire est symétrisée et tente une nouvelle fois de fusionner", ...onTop],
	 ["Si aucune fusion n'opère, la réaction échoue et les chaines sont ajoutées à la liste de réactifs du besher, elles essaieront de fusionner de nouveau si une nouvelle chaine se présente", ...onTop],
	 ["Si au moins une extrémité fusionne, la réaction est un succès et la nouvelle chaine peut être récupérée en sortie", ...onTop],
	 ["Je vous invite fortement à commencer par raccorder les entrées d'un bescher et observer ce qu'il se passe", ...onTop],
	 ["répétez l'opération plusieurs fois dans différentes configurations jusqu'à ce que le processus vous semble logique", ...onTop],
	 ["puis tentez d'effectuer 2 fusions en parallèle permettant de satisfaire les critères de cette épreuve", ...onTop],
	 []
	],
	false
);

sceneManager.addScene(
	"LVL_4",
	4, 8,
	[[Erlenmeyer.id, 0, 2, 2, false, [84, new Molecule([2,-1])]],
	 [Erlenmeyer.id, 2, 2, 2, false, [75, new Molecule([1,-2])]],
	 [Vessel.id, 6, 3, 1, false, [24, new Molecule([2,-1,1,-2,2,-1])]],
	 [Vessel.id, 7, 3, 1, false, [24, new Molecule([2,-1,1,-2,2,-1])]],
	],
	[],
	[[-1, false], [3, true], [0, false], [5, true], [0, false]],
	[["Bien disciple", ...onTop],
	 ["Je peux maintenant vous laisser utiliser ma grande verrerie", ...onTop],
	 ["Je vous prête 3 beschers ☛\nvous pouvez utiliser la molette de la souris pour changer leur taille", "8vw", none, 0, none, "45%", none],
	 ["Un grand bescher vaut autant que 2 petits", "8vw", none, 0, none, "45%", none],
	 ["Remarquez qu'un grand bescher fonctionne pareillement à un bescher plus petit, à la seule différence qu'il est pourvu de 2 sorties et non d'une seule", ...onTop],
	 ["Remarquez également que vous pouvez désormais poser de grandes étagères ☛\npour le prix de 2 petites", "15vw", none, 0, none, "46%", none],
	 ["Je pense que nous avons revu l'essentiel ensemble disciple", ...onTop],
	 ["A vous de me prouver que ces années à mon service n'ont pas été vaines...", ...onTop],
	 []
	],
	false
);

sceneManager.addScene(
	"LVL_5",
	5, 10,
	[[Erlenmeyer.id, 0, 3, 2, true, [192, O]],
	 [Erlenmeyer.id, 2, 3, 2, true, [192, D]],
	 [Erlenmeyer.id, 4, 3, 2, true, [192, V]],
	 [Vessel.id, 7, 4, 1, false, [24, new Molecule([1,-2,3,2,-1,1,-2,3])]],
	],
	[],
	[[-1, false], [5, true], [5, false], [10, true], [5, true]],
	[["Bien disciple", ...onTop],
	 ["J'espère que vous n'êtes pas au bout de vos ressources, car voici la première épreuve", ...onTop],
	 []
	],
	false
);

sceneManager.addScene(
	"LVL_6",
	5, 10,
	[[Erlenmeyer.id, 0, 3, 2, true, [192, O]],
	 [Erlenmeyer.id, 2, 3, 2, true, [192, D]],
	 [Erlenmeyer.id, 4, 3, 2, true, [192, V]],
	 [Vessel.id, 9, 4, 1, true, [1, new Molecule([-1,1,-2,3,-3,2,-2])]],
	],
	[],
	[[-1, false], [10, true], [10, false], [20, true], [5, true]],
	[["Bien disciple", ...onTop],
	 ["épreuve suivante", ...onTop],
	 []
	],
	false
);

/*sceneManager.addScene(
	"LVL_6",
	4, 8,
	[[Erlenmeyer.id, 0, 2, 2, false, [192, D]],
	 [Bescher.id, 2, 2, 2, true, [100, O]],
	 [Vessel.id, 7, 3, 1, false, [1, new Molecule([-2,2,-2,2-2,3,2,-2,2,-2,2])]],
	],
	[],
	[[-1, false], [2, true], [2, false], [5, true], [0, false]],
	[],
	false
);*/

sceneManager.addScene(
	"DEMO",
	5, 10,
	matToList(5, 10,
	[[0,0,0,0,0,0,0,0,0,0],
	 [0,0,0,1,0,3,0,3,0,0],
	 [0,0,2,0,0,3,0,3,0,0],
	 [2,0,1,0,2,3,0,1,0,0],
	 [0,0,0,0,0,5,0,0,0,0]],
	[[0,0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0,0],
	 [1,0,1,0,0,0,0,1,0,0],
	 [0,0,0,0,0,0,0,0,0,0]],
	[[0,0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,1,0,1,0,0],
	 [0,0,0,1,0,1,0,1,0,0],
	 [0,0,1,0,0,1,0,1,0,0],
	 [0,0,0,0,1,1,0,0,0,0]],
	[[0,0,0,0,0,0,0,0,0,0],
	 [0,0,0,[3,r2],0,0,0,0,0,0],
	 [0,0,[5,D],0,0,0,0,0,0,0],
	 [0,0,[96,r4],0,[18,V],[24,O],0,0,0,0],
	 [0,0,0,0,0,0,0,0,0,0]]),

	[[[3,1,2,4],[0,-5],[4,0],[0,15]],
	 [[5,1,2,2],[0,-5],[-4,0],[0,15]],
	 [[2,2,2,5],[0,-6],[-4,0],[0,-1],[1,0],[0,2],[-5,0],[0,1],[3,0],[0,1],[-2,0],[0,1],[1,0],[0,6]]],

	[[-1, false], [-1, true], [-1, false], [-1, true], [-1, false]],

	[["Vous avez fini les niveaux disponibles...", ...onTop],
	 ["Vous pouvez directement passer à la scène suivante pour le mode \"ressources illimitées\"", ...onTop],
	 []
	],
	true
);

sceneManager.addScene(
	"CREA",
	5, 10,
	[[Erlenmeyer.id, 0, 3, 2, true, [192, O]],
	 [Erlenmeyer.id, 2, 3, 2, true, [192, D]],
	 [Erlenmeyer.id, 4, 3, 2, true, [192, V]],
	],
	[],
	[[-1, false], [-1, true], [-1, false], [-1, true], [-1, true]],
	[["Vous disposez d'autant d'éléments que vous désirez", ...onTop],
	 []
	],
	false
);

START = 0;
