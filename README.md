# p5 Clustering Visialization

This projekt visualizes the k-means clustering algorithm and hierarchical clustering in p5, clustering an arbitrary amount of 2D-Points.

> The sketch has been bootstrapped with the [generator-p5-webpack for Yeoman](http://bit.ly/2qPAhgF).

## Contents

* [Background](#background)
* [Implementations](#implementations)
	* [K-means](#k-means)
		* [General algorithm](#k-means-general)
		* [Implementation in this project](#k-means-implementation)
		* [Parameters](#k-means-parameters)
	* [Hierarchical clustering](#hierarchical)
		* [General algorithm](#hierarchical-general)
		* [Implementation in this project](#hierarchical-implementation)
		* [Parameters](#hierarchical-parameters)
		* [Draw mode](#hierarchical-draw-mode)
		* [Proximity methods](#hierarchical-proximity-methods)
* [Creation of random points](#random-point-creation)
* [Running the project locally](#running-locally)
* [License](#license)

## <a name="background"></a>Background

In data mining clustering (also cluster analysis) techniques are used to group together similar data points in a set of data.
In this specific project, data points are represented as points in a 2D context.

[Wikipedia: Cluster analysis](https://en.wikipedia.org/wiki/Cluster_analysis)

## <a name="implementations"></a>Implementations

### <a name="k-means"></a>K-means

[Wikipedia: k-means clustering](https://en.wikipedia.org/wiki/K-means_clustering)

#### <a name="k-means-general"></a>General Algorithm

The k-means algorithms esentially works this way:

1. Generate data points or load data points from any source.
1. Select initial center point of cluster for every cluster you want to make.
1. For each data point:
	1. Calculate the eudclidian distance from the point to every cluster's center
	2. Assign the point to the cluster with the lowest distance to the center.
1. Update the center of each cluster to the mean of the positions of all of the points in the cluster.
1. If at least one point has been assigned to a new cluster, jump to step 3.	

#### <a name="k-means-implementation"></a>Implementation in this project

1. **Point creation**
	1. Initially the number of points you specified as `NUM_POINTS` is [randomly generated](#random-point-creation).
	2. You can always add new points to the system by clicking in the canvas or dragging the mouse over the canvas.
	3. By clicking "Finish creating points" the cluster creation mode is entered.
2. **Cluster creation**
	1. Initially the nuber of initial clusters you specified as `NUM_CLUSTERS` are generated by randomly picking a point as the cluster's center.
	2. You can click on any point to create additional clusters (if you want to set all of the clusters manually, set `NUM_CLUSTERS` to `0`).
	3. By clicking "Start clustering" the k-means algorithm starts.
3. **Clustering**
	1. As the points are assigned to clusters their color changes to the color of the cluster they have been assigned to.
	2. You can tweak the speed of the algorithm by changing the `ACTIONS_PER_FRAME` parameter.
	3. During clustering you can still add new points and see how the clusters change.

#### <a name="k-means-parameters"></a>Parameters	

|Name|Description|
|----|----|
|`NUM_CLUSTERS`|The number of clusters to be automatically created|
|`NUM_POINTS`|The number of points to be [randomly created](#random-point-creation)|
|`NUM_HOTSPOTS`|The number of hotspots for [random point creation](#random-point-creation)|
|`HOTSPOT_NOISE`|The noise value for points outside a [hotspot](#random-point-creation)|
|`ACTIONS_PER_FRAME`|The number of points being assigned to a cluster per animation frame|
|`CANVAS_SIZE`|The canvas' width and height in pixels|

### <a name="hierarchical"></a>Hierarchical clustering

[Wikipedia: Hierarchical clustering](https://en.wikipedia.org/wiki/Hierarchical_clustering)

#### <a name="hierarchical-general"></a>General algorithm

The hierarchical clustering algorithm essentially works this way:

1. Generate data points or load data points from any source.
2. Generate a cluster for each point and put them in a set of top-level clusters.
3. While the number of top-level clusters is higher than the desired number of clusters.
	1. Calculate the proximities of all clusters to each other according to the specified [proximity method](#hierarchical-proximity-methods).
	2. Take the pair of clusters with the lowest distance (highest proximity).
	3. Merge the two clusters into a new one.
	4. Insert the new merged cluster into the set of top-level clusters and remove clusters than have been merged from the set of top-level clusters.

#### <a name="hierarchical-implementation"></a>Implementation in this project

1. **Point creation**
	1. Initially the number of points you specified as `NUM_POINTS` is [randomly generated](#random-point-creation) (for hierarchical clustering the default value of `NUM_POINTS` is `0`).
	2. You can add new points to the system by clicking in the canvas or dragging the mouse over the canvas.
	3. By clicking "Start clustering" the hierarchical clustering algorithm stars.
1. **Clustering**
	1. The algorithm merges the two clusters with the lowest distance and visualizes them according to the [`DRAW_MODE`](#hierarchical-draw-modes).
	2. The number above the canvas indicates the number of top-level clusters currently existing.
	3. The algorithm stops when the number of top-level clusters is equal to the value of the `NUM_CLUSTERS` parameter.

#### <a name="hierarchical-parameters"></a>Paramters

|Name|Description|
|----|----|
|`DRAW_MODE`|The mode to [draw the clusters](#hierarchical-draw-modes)|
|`PROXIMITY_METHOD`|The [proximity method](#hierarchical-proximity-methods) to use for proximity calculation|
|`NUM_CLUSTERS`|The number of target clusters|
|`NUM_POINTS`|The number of points to be [randomly created](#random-point-creation)|
|`NUM_HOTSPOTS`|The number of hotspots for [random point creation](#random-point-creation)|
|`HOTSPOT_NOISE`|The noise value for points outside a [hotspot](#random-point-creation)|
|`CANVAS_SIZE`|The canvas' width and height in pixels|

#### <a name="hierarchical-draw-modes"></a>Draw modes

Two draw modes are available to draw the generated clusters during the clustering process:

|Name|Description|
|----|----|
|`CIRCLES`|All points are drawn as regular points with their initial color. All intermediate clusters and top-level clusters are drawn as semi-opaque circles^1.|
|`COLORS`|All points are drawn as regular points. The points' colors change according to which top-level cluster they belong. When the clustering algorithm has finished all top-level clusters are sorrounded by a circle^1.|

^1 The circle drawn around a cluster have their center at the cluster's center and the radius equals the distance from the center of the cluster to the position of the point in the cluster's sub-tree that is furthest away from the cluster's center. This somtimes lets the circles overlap, though the actual clusters do not actually overlap themselves.

#### <a name="hierarchical-proximity-methods"></a>Proximity methods

|Name|Description|
|----|----|
|Single link|The distance of two clusteres is determined by the lowest distance of all pairs^1 of points in the two clusters.|
|Complete link|The distance of two clusteres is determined by the highest distance of all pairs^1 of points in the two clusters.|
|Average|The distance of two clusters is determined by the averagy distance of each pair^1 of points in the two clusters.|
|Centroid|The distance of two clusters is determined by the distance of the centers of the two clusters|

 ^1 A pair always consists of one point from the first and one from the second cluster. There must not be two points from the same cluster in a pair.

## <a name="random-point-creation"></a>Creation of random points

For the creation of random points three parameters are relevant: `NUM_POINTS`, `NUM_HOTSPOTS`, `HOTSPOT_NOISE`.

The points are randomly generated in the following way:

1. If `NUM_HOTSPOTS` is greater than `0`, the specified number of hotspots are generated with a random location and a random radius.  
The radiuses of the hotspots are smaller the more hotspots there are.
2. `NUM_POINTS` points are generated
	* If there are no hotspots, each point will be assigned a random location.
	* If there are hotspots, points will be assigned a location close to a random hotspot.
	* `HOTSPOT_NOISE` defines the probability at which a point is assigned a random location regardless of the number of hotspots. When set to `0` there won't be any points outside a hotspot radius, whereas when set to `1` all of the points will be assigned random locations (same as setting `NUM_HOTSPOTS` to `0`).

## <a name="running-locally"></a>Running the project locally

* Clone the repository from GitHub
* run `yarn install`
* run `yarn start`

> Instead of yarn you can for sure use npm

## <a name="license"></a>License

GPL-3.0 © [Jannik Portz](http://jannikportz.de)
