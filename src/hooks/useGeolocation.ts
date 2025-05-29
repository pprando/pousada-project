import { useState } from 'react';

interface GeolocationState {
  loading: boolean;
  error: string | null;
  address: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    address: null,
  });

  const getAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=pt-BR`
      );
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Formata o endereço de forma amigável
      const { address } = data;
      const formattedAddress = [
        address.road,
        address.house_number,
        address.suburb,
        address.city,
        address.state,
        address.postcode
      ]
        .filter(Boolean)
        .join(', ');

      return formattedAddress;
    } catch (error) {
      throw new Error('Não foi possível obter o endereço');
    }
  };

  const getCurrentLocation = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocalização não é suportada pelo seu navegador',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const address = await getAddress(
            position.coords.latitude,
            position.coords.longitude
          );
          setState({
            loading: false,
            error: null,
            address,
          });
        } catch (error) {
          setState({
            loading: false,
            error: 'Erro ao obter endereço',
            address: null,
          });
        }
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informação de localização indisponível';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo de espera para obter localização esgotado';
            break;
        }
        setState({
          loading: false,
          error: errorMessage,
          address: null,
        });
      }
    );
  };

  return {
    ...state,
    getCurrentLocation,
  };
}