{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.libuuid
    # ... other dependencies
  ];

  # Set the library path (LD_LIBRARY_PATH) to include the libuuid library
  shellHook = ''
    export LD_LIBRARY_PATH=${pkgs.libuuid}/lib:$LD_LIBRARY_PATH
  '';
}
