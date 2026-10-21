# Source this: points the backend at the dedicated load-test MariaDB (docker: sudosos-balance-lt, port 3307).
export TYPEORM_CONNECTION=mariadb TYPEORM_HOST=127.0.0.1 TYPEORM_PORT=3307 TYPEORM_DATABASE=balance_lt TYPEORM_USERNAME=root TYPEORM_PASSWORD=root
