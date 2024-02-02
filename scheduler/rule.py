import builtins
import inspect
from abc import ABC, abstractmethod
from typing import Any, Dict

import networkx as nx

from blocks import BaseBlock
from exceptions import GraphCheckError


class NotDAGError(GraphCheckError):
    def __init__(self):
        super(NotDAGError, self).__init__("graph is not a valid DAG")


class PortMismatchError(GraphCheckError):
    def __init__(self, source: str, sink: str, port: str):
        super(PortMismatchError, self).__init__(f"port type mismatch on {sink}.{port}")


class EndpointNotExistError(GraphCheckError):
    def __init__(self, node: str, port: str = None):
        if port is not None:
            node += "." + port
        super(EndpointNotExistError, self).__init__(f"edge endpoint {node} not exist")


class PortNotConnectedError(GraphCheckError):
    def __init__(self, node: str, port: str):
        super(PortNotConnectedError, self).__init__(f"port {node}.{port} not connected")


class InputOutputCountError(GraphCheckError):
    def __init__(self, input_count: int, output_count: int):
        super(InputOutputCountError, self).__init__(
            "expect exactly one input and output block, "
            f"got {input_count} input blocks and {output_count} output blocks",
        )


class TypeNoStrMethodError(GraphCheckError):
    def __init__(self, _type: type) -> None:
        super(TypeNoStrMethodError, self).__init__(f'{_type} has no "__str__" method')


class Rule(ABC):
    @abstractmethod
    def check(self, g: nx.DiGraph, nodes: Dict[str, BaseBlock]):
        ...


class EndpointExist(Rule):
    """
    EndpointExist ensure that the ports at both ends of an edge must exist
    """

    def check(self, g: nx.DiGraph, nodes: Dict[str, BaseBlock]):
        for e in g.edges(data=True):
            if e[0] not in nodes:
                raise EndpointNotExistError(e[0])
            if e[1] not in nodes:
                raise EndpointNotExistError(e[1])

            sink_signature = inspect.signature(nodes[e[1]].__call__)
            # if sink_signature has **kwargs, it will accept any unknown ports
            for param in sink_signature.parameters.values():
                if param.kind == param.VAR_KEYWORD:
                    return

            if (
                e[2]["port"] is not None
                and e[2]["port"] not in sink_signature.parameters
            ):
                raise EndpointNotExistError(e[1], e[2]["port"])


class RequiredInPortIsFit(Rule):
    """
    RequiredPortIsFit ensure that the in ports without a default
    value in sink nodes must be connected by edge.
    """

    def check(self, g: nx.DiGraph, nodes: Dict[str, BaseBlock]):
        for node_id, node in nodes.items():
            required_ports = set()
            signature = inspect.signature(node.__call__)

            for param_name, param in signature.parameters.items():
                if (
                    param.default == inspect.Parameter.empty
                    and param.kind != inspect.Parameter.VAR_KEYWORD
                ):
                    required_ports.add(param_name)

            for e in g.in_edges(node_id, data=True):
                if e[2]["port"] is not None and e[2]["port"] in required_ports:
                    required_ports.remove(e[2]["port"])

            if len(required_ports) > 0:
                # pick any port
                first_port = list(required_ports)[0]
                raise PortNotConnectedError(node_id, first_port)


class GraphIsDAG(Rule):
    """
    GraphIsDAG ensure that the graph must be a DAG graph
    """

    def check(self, g: nx.DiGraph, nodes: Dict[str, BaseBlock]):
        if not nx.is_directed_acyclic_graph(g):
            raise NotDAGError()


class ExactlyOneInputAndOutput(Rule):
    """
    ExactlyOneInputAndOutput ensures that there is exactly one input and one output
    """

    def check(self, g: nx.DiGraph, nodes: Dict[str, BaseBlock]):
        input_count = 0
        output_count = 0

        for node in nodes.values():
            if node.is_input:
                input_count += 1
            if node.is_output:
                output_count += 1

        if input_count != 1 or output_count != 1:
            raise InputOutputCountError(input_count, output_count)


class PortTypeMatch(Rule):
    """
    PortTypeMatch ensure that the ports at both sides of a edge should be compatible
    """

    def check(self, g: nx.DiGraph, nodes: Dict[str, BaseBlock]):
        for e in g.edges(data=True):
            if not self.is_port_type_match(nodes[e[0]], nodes[e[1]], e[2]["port"]):
                raise PortMismatchError(e[1], e[1], e[2]["port"])

    def is_port_type_match(
        self, source_node: BaseBlock, sink_node: BaseBlock, port: str
    ) -> bool:
        # 'None' port accept anything
        if port is None:
            return True

        source_signature = inspect.signature(source_node.__call__)
        sink_signature = inspect.signature(sink_node.__call__)

        # unknown port accept anything
        if port not in sink_signature.parameters:
            return True

        source_type = source_signature.return_annotation
        sink_type = sink_signature.parameters[port].annotation

        if sink_type == inspect._empty:
            return True
        return issubclass(source_type, sink_type)


class TypeHasStrMethod(Rule):
    def check(self, g: nx.DiGraph, nodes: Dict[str, BaseBlock]):
        for e in g.edges(data=True):
            node = nodes[e[0]]
            node_signature = inspect.signature(node.__call__)
            output_type = node_signature.return_annotation
            if self.is_builtin_type(output_type):
                continue
            if not self.type_has_str_method(output_type):
                raise TypeNoStrMethodError(output_type)
        return True

    def type_has_str_method(self, _type: type) -> bool:
        return _type.__str__ is not object.__str__

    def is_builtin_type(self, _type: type) -> bool:
        return _type in vars(builtins).values()
