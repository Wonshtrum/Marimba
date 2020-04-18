let emptyHand = [[-1, false], [0, false], [0, false], [0, false], [0, false]];
let onTop = [none, none, none, none, undefined, none];
sceneManager.addScene(
	"HELLO",
	3, 6,
	[[Erlenmeyer.id, 0, 1, 2, false, [60, r4]]],
	[],
	emptyHand,
	[["Bonjour Disciple"],
	 ["Il est temps de me montrer que vous êtes à la hauteur de mes attentes", ...onTop],
	 ["Vous serez confronté à 10 épreuves. Si vous arrivez à toutes les passer seulement, je vous accorderais de m'aider dans mes expériences.", ...onTop],
	 ["Pour chaque épreuve je poserai sur la table de la verrerie que je vous interdis de déplacer\n☚", "14vw", none, "20vw", none, "50%", none],
	 ["Ainsi que de la verrerie dont vous disposerez à votre guise\n☛", 0, none, 0, none, "30%", none],
	 ["Vous pourrez utiliser autant de tuyauterie que vous le désirez", 0, none, 0, none, "30%", none],
	 ["Je vous rappelle que nous, les Alchimistes de Platos, ne manipulons que les 5 éléments purs :", ...onTop],
	 ["le feu ◀ et sa symétrie ▶"],
	 ["l'argent ◗ et sa symétrie ◖"],
	 ["et l'or ◉"],
	 ["Tout autre élément peut être obtenu par la combinaison de ces 5 primitives", ...onTop],
	 ["En passant votre curseur vide (déjà sélectionné) ☛\nsur un élément de la verrerie", 0, none, 0, none, none, none],
	 ["Vous pouvez afficher la composition de la solution contenue\n☚", "20vw", none, none, "11vw", "60%", none],
	],
	true
);

sceneManager.addScene(
	"NIV_1",
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
	 ["En passant votre curseur vide sur les fioles vous pouvez voir, sous la composition de leur contenue, le résultat attendu ☛", "2vw", none, "11vw", none, "71%", none],
	 ["Afin d'effectuer le transfert vous devez utiliser des tuyaux", ...onTop],
	 ["Vous pouvez en placer avec votre curseur vide ☛\n(déjà sélectionné)", 0, none, 0, none, none, none],
	 ["En enfonçant le clic sur une sortie (indiquée en vert)\n☚", "2vw", none, none, "3vw", "32%", none],
	 ["et en etirant le tuyaux jusqu'à une entrée (indiquée en rouge) ☛", "8vw", none, "15vw", none, "56%", none],
	 ["si le placement est valide, le tuyaux doit s'illuminer, vous pouvez alors relacher la souris", ...onTop],
	 ["Essayez !", ...onTop],
	 ["Vous pouvez retirer tout élément de verrerie et tuyauterie avec le clic droit, sauf ceux que j'ai moi même posé bien sûr !", ...onTop],
	 ["Essayez !", ...onTop],
	 ["Une fois votre dispositif en place, vous pouvez appuyer sur la touche \"espace\" pour procéder à la réaction", ...onTop],
	 ["Remarquez que le carré de votre curseur est rouge tant que la réaction est  en cours", ...onTop],
	 ["Attention disciple ! Je vous interdis de modifier votre installation tant que la réaction est en cours !", ...onTop],
	 ["Une seconde pression sur \"espace\" met en pause la reaction et vous permet de modifier de nouveau votre dispositif", ...onTop],
	 ["Seulement ne trichez pas disciple ! Je ne considère un montage correct que si la réaction n'est jamais interrompue", ...onTop],
	 ["A tout moment vous pouvez réinitialiser la réaction avec la touche \"entrer\"", ...onTop],
	 ["La touche \"retour arrière\" réinitialise tout votre montage, utilisez la avec prudence !", ...onTop],
	 ["Je pense en avoir assez dit disciple... C'est à vous de jouer !", ...onTop],
	 ["", ...onTop],
	],
	false
);

sceneManager.addScene(
	"NIV_2",
	3, 6,
	[[Erlenmeyer.id, 2, 2, 1, false, [24, r1]],
	 [Vessel.id, 3, 2, 1, false, [8, O]],
	],
	[],
	[[-1, false], [0, false], [2, false], [2, false], [2, false]],
	[["Bien disciple, passons à la distillation", ...onTop],
	 ["Je vous prête 2 tours de distillation ☛\n\n\n2 étagères ☛\n\n\net 2 bruleurs ☛", none, 0, 0, none, "27%", none],
	 ["C'est plus que le nécessaire", none, "10vw", 0, none, "30%", none],
	 ["Vous pouvez selectionner un élément est tenter de le placer sur la table, votre curseur devient vert si la position est valide", ...onTop],
	 ["Remarquez que vous pouvez poser une étagère sur un élément ou un élément dans étagère", ...onTop],
	 ["Un élément ne peut être poser que sur la table ou sur une étagère", ...onTop],
	 ["Je vous invite à monter et démonter plusieurs configurations pour vous faire la main", ...onTop],
	 ["Maintenant que vous êtes familier avec le système de placement...", ...onTop],
	 ["je vous rappelle qu'une tour de distillation placer au dessus d'un bruleur retire un élément au début et à la fin d'une chaine (si la chaine possède au moins 3 éléments)", ...onTop],
	 ["Sachant cela, je vous demande de raffiner autant que possible le contenu de cet Erlenmeyer ☛", none, "5vw", 0, "1vw", "37%", none],
	 []
	]
);


START = 2;
