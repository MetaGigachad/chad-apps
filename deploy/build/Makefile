.PHONY: gen_auth_localhost_cert
gen_auth_localhost_cert:
	cd gateway/ssl && \
		openssl req -x509 -out auth.localhost.crt -keyout auth.localhost.key \
		  -newkey rsa:2048 -nodes -sha256 \
		  -subj '/CN=auth.localhost' -extensions EXT -config <( \
		   printf "[dn]\nCN=auth.localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:auth.localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

.PHONY: gen_onboarding_localhost_cert
gen_onboarding_localhost_cert:
	cd gateway/ssl && \
		openssl req -x509 -out onboarding.localhost.crt -keyout onboarding.localhost.key \
		  -newkey rsa:2048 -nodes -sha256 \
		  -subj '/CN=onboarding.localhost' -extensions EXT -config <( \
		   printf "[dn]\nCN=onboarding.localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:onboarding.localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
