# -*- coding: utf-8 -*-
"""
Created on Sat Sep 15 04:08:48 2018

@author: Jeff, Steven
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from IPython import get_ipython as ipy
ipy().magic("matplotlib qt5")

"""
Part 1: Identifying Clusters and Outliers

"""

colors = ["red", "blue", "green", "orange", "purple", "black", "pink", "white", "white", "white"] # For debug purposes, group into clusters.
np.random.seed(0)
"""
x_val = np.concatenate((np.random.normal(2, 1, 20), np.random.normal(6.5, 1.5, 25), np.random.uniform(0, 10, 10)))
y_val = np.concatenate((np.random.normal(2, 1, 20), np.random.normal(5, 1, 25), np.random.uniform(0, 10, 10)))
"""
# 25 points sample size
# Gridspace is 10x10
"""
x_val = np.concatenate((np.random.uniform(1, 3, 10), np.random.uniform(5, 8, 10), np.random.uniform(0, 10, 5)))
y_val = np.concatenate((np.random.uniform(1.5, 3.5, 10), np.random.uniform(4, 6, 10), np.random.uniform(0, 10, 5)))
"""
x_rand = np.random.randint(1, 3)
y_rand = np.random.randint(2, 4)

x_val = np.concatenate((np.random.uniform(x_rand, x_rand + 3, 10), np.random.uniform(x_rand + 5, x_rand + 7, 10), np.random.uniform(0, 10, 5)))
y_val = np.concatenate((np.random.uniform(y_rand, y_rand + 2, 10), np.random.uniform(y_rand + 2, y_rand + 4, 10), np.random.uniform(0, 10, 5)))


# Unsupervised ML model to detect clustering patterns and outliers. 
from sklearn.cluster import DBSCAN

dbscan = DBSCAN(eps=0.9, min_samples=4)
dbscan_label = dbscan.fit_predict(x_val.reshape(-1, 1))

plt.clf()
plt.figure()
plt.scatter(x_val, y_val, c=[colors[i+1] for i in dbscan_label], marker='^')


df = pd.DataFrame([x_val, y_val, dbscan_label], index=["X", "Y", "label"]).T

num_labels = int(max(df["label"])) + 1

clusters = []

for i in range(0, num_labels):
    condition = df['label'] == i
    clusters.append(df[condition])
    
cluster_outlier = pd.DataFrame(df[df["label"] == -1])

cluster_centroids = []    
cluster_centroids_std = []
for i in range(0, num_labels):
    x_avg = clusters[i]["X"].mean()
    y_avg = clusters[i]["Y"].mean()
    cluster_centroids.append([x_avg, y_avg])
    x_std = clusters[i]["X"].std()
    y_std = clusters[i]["Y"].std()
    cluster_centroids_std.append([x_std, y_std])

clusters_updated = []
cluster_centroids_updated = [] 
cluster_centroids_std_updated = []
   
for i in range(0, num_labels):
    if cluster_centroids_std[i][0] <= 1.25 or cluster_centroids_std[i][1] <= 1.25: # If std dev is more than 1/8 of gridspace
        condition1 = df['label'] == i
        condition2 = df['X'] > cluster_centroids[i][0] - 1.4 * cluster_centroids_std[i][0]
        condition3 = df['X'] < cluster_centroids[i][0] + 1.4 * cluster_centroids_std[i][0]
        condition4 = df['Y'] > cluster_centroids[i][1] - 1.4 * cluster_centroids_std[i][1]
        condition5 = df['Y'] < cluster_centroids[i][1] + 1.4 * cluster_centroids_std[i][1]
        clusters_updated.append(df[condition1 & condition2 & condition3 & condition4 & condition5]) # Both x and y coordinates within range to be considered part of cluster. 
        cluster_outlier = cluster_outlier.append(df[condition1 & ~(condition2 & condition3 & condition4 & condition5)])
    
for i in range(0, num_labels):
    x_avg = clusters_updated[i]["X"].mean()
    y_avg = clusters_updated[i]["Y"].mean()
    cluster_centroids_updated.append([x_avg, y_avg])
#    x_std = clusters_updated[i]["X"].std()
#    y_std = clusters[i]["Y"].std()
#    cluster_centroids_std_updated.append([x_std, y_std])

cluster_centroids_updated = np.array(cluster_centroids_updated)
plt.scatter(cluster_centroids_updated[:, 0], cluster_centroids_updated[:, 1], c="lime", marker='8')

for i in range(len(clusters_updated)):
    plt.scatter(clusters_updated[i]["X"], clusters_updated[i]["Y"], c=colors[i+1], marker="o")

# Important Variables: cluster_outlier

cluster_outlier.drop("label", axis=1, inplace=True)
for i in range(len(cluster_centroids_updated)):
    cluster_outlier.loc[i + 200] = cluster_centroids_updated[i] # Add in coordinates determining centroid of clusters
current_node = (0, 0)


def greedy_path(dataframe):
    x1, y1 = current_node
    distlist = []
    for i in dataframe.values: 
        x2, y2 = i
        distance = ((x2-x1)**2 + (y2-y1)**2) ** 1/2
        distlist.append(distance) # Indices are different for both datasets.
        
    dataframe["Distance"] = distlist
    return dataframe[dataframe["Distance"] == dataframe.min()[-1]].index[0] # Returns index where coordinates of min distance can be found. 

with open("path.txt", 'w') as f:
    f.write("") # To delete any previous content

with open("path.txt", 'a') as f: #For auto-garbage handling.
    for i in range(len(cluster_outlier)):
        index = greedy_path(cluster_outlier)
        current_node = tuple(cluster_outlier.loc[index][:2])
        f.write("{:.3f},{:.3f}|".format(current_node[0], current_node[1]))
        cluster_outlier = cluster_outlier.drop(index).drop("Distance", axis=1)

f.close()
