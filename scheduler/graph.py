from collections import namedtuple
from typing import Dict, List

import networkx as nx

from blocks import BaseBlock

Edge = namedtuple("Edge", ["source", "sink", "port", "case"])


class Graph:
    """
    The primary class of the scheduler module, which represents a DAG graph.

    When executed, it will run each node of the DAG until the last node (OutputBlock).
    """

    def __init__(
        self,
        nodes: Dict[str, BaseBlock],
        edges: List[Edge],
        skip_validation: bool = False,
    ):
        """
        Args:
            nodes (dict): the nodes of the DAG, composed of BaseBlock instances and their unique ids.
            edges (list): directed edges connecting the nodes, where their direction represents the flow of data.
            skip_validation (bool): whether the validity of the DAG graph needs to be checked.
        """
        super(Graph, self).__init__()
        self.g = nx.DiGraph()
        self.nodes = nodes
        for e in edges:
            self.g.add_edge(e.source, e.sink, port=e.port, case=e.case)
