.PHONY: fmt

fmt:
	find . -name "*.py" -exec isort {} \;
	find . -name "*.py" -exec black {} \;