<p align="left">
<img src="swissBackup.png" width="100">
</p>

# Add-on SwissBackup 

Une solution dédiée pour l'ensemble de vos noeuds Jelastic permettant la configuration simple de plan de sauvegardes pour
chacuns de vos containers. Utilisant la fiabilité des infrastructures dédiées à SwissBackup l'ensemble de vos données sont
chiffrées end-to-end et répliquées 3 fois sur 3 lieux géographiques différents. Vous pouvez aisément restauré une sauvegarde
sur n'importe quel noeud de votre compte.

## Backup Process

Il y a 2 types de sauvegardes possbiles.

### Back-up specific folders
<img src="Capture d’écran 2020-04-13 à 09.44.15.png">

Quand vous sélectionnez Back-up specifics folders le champ Folders to back-up apparait.Celui-ci permet la spécification
des dossiers à sauvegarder, vous pouvez specifier plusieurs dossiers ( séparer chaques chemins par une "," ). Il faut renseigner le chemin absoliue de chaques dossiers que l'on désire sauvegarder.


Exemple : /root/admin/, /home/user1/, /jelastic/containers/

Dans cet exemple 3 dossiers ont été spécifié.

<img src="Capture d’écran 2020-04-13 à 09.44.15.png">


Après avoir spécifié ces dossiers il faut sélectionner un plan de sauvegarde.

